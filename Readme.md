A simple CLI tool for to manage your passwords

## Installation

To install the package, run the following command:

npm i manage-password

## Usage

First you need to set the master password

    > manage-password set master

This will prompt you to "Enter the password" and will save the given password.

After setting the master password you can set your account or device password

    > manage-password set my-device-name

You can retrive your password using this command

    > manage-password get my-device-name

This will prompt you to enter the master password for authentication and retrives your password

Instead of setting password u can also generate it

    > manage-password set my-device-name

It will ask for the purpose for which you would need this password and how long it should be.
