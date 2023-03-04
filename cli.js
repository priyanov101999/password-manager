#!/usr/bin/env node
import commander from "commander";
import inquirer from "inquirer";
import redis from "ioredis";
import { promisify } from "util";

const program = new commander.Command();

// Define Redis client options
const redisOptions = {
  host: "localhost",
  port: 6379,
};

// Create Redis client
const redisClient = redis.createClient(redisOptions);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

redisClient.on("ready", async function () {
  program
    .command("get <purpose>")
    .description("Get a saved password")
    .action(async (purpose) => {
      inquirer
        .prompt([
          {
            type: "string",
            name: "masterPassword",
            message: "Enter your master password:",
          },
        ])
        .then(async (answers) => {
          const masterPassword = await getAsync("master");
          if (!masterPassword) {
            console.log(
              `First set the master password to use password manager! You can set it using 'set master'`
            );
          } else if (masterPassword != answers.masterPassword) {
            console.log("Master password is incorrect!");
          } else {
            const password = await getAsync(purpose);
            if (password) {
              console.log(`Your ${purpose} password is: ${password}`);
            } else {
              console.log(`No password found for ${purpose}`);
            }
          }
          redisClient.quit();
        });
    });

  program
    .command("generate")
    .description("Generate a new random password")
    .action(() => {
      inquirer
        .prompt([
          {
            type: "input",
            name: "purpose",
            message: "What is this password for?",
          },
          {
            type: "number",
            name: "length",
            message: "How long should the password be?",
            default: 12,
          },
        ])
        .then(async (answers) => {
          const masterPassword = await getAsync("master");
          if (answers.purpose == "master" || masterPassword) {
            console.log("Generating password...");
            const password = generatePassword(answers.length);
            await setAsync(answers.purpose, password);
            console.log(`Saved ${answers.purpose} password: ${password}`);
          } else {
            console.log(
              `First set the master password to use password manager! You can set it using 'set master'`
            );
          }
          redisClient.quit();
        });
    });

  program
    .command("set <purpose>")
    .description("Set password")
    .action((purpose) => {
      inquirer
        .prompt([
          {
            type: "string",
            name: "password",
            message: "Enter the password",
          },
        ])
        .then(async (answers) => {
          const masterPassword = await getAsync("master");
          if (purpose == "master" || masterPassword) {
            await setAsync(purpose, answers.password);
            console.log(`Saved ${purpose} password: ${answers.password}`);
          } else {
            console.log(
              `First set the master password to use password manager! You can set it using 'set master'`
            );
          }
          redisClient.quit();
        });
    });

  // Parse command-line arguments
  program.parse(process.argv);
});

// Generate a random password
function generatePassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
