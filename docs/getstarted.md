# Get Started

Getting Started is very easy if you already have node and postgres.

Super Quick Start:

```bash
npm init -y
npm install -S @primecms/core @primecms/ui
npx primecms start
```

## Installing requirements

These are the requirements for prime:

 - PostgreSQL 9.4+
 - Node (Active LTS)

<details><summary>Mac OS X</summary>
<p>

Install brew
```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Install postgresql and node
```bash
brew install node postgresql
brew services start postgresql
```
</p>
</details>

<details><summary>Windows</summary>
<p>

 - [Download NodeJS](https://nodejs.org/en/)
 - [Download PostgreSQL](https://www.postgresql.org/download/windows/)
</p>
</details>

<details><summary>Linux (Ubuntu/debian)</summary>
<p>

```bash
sudo apt-get install -y postgresql nodejs
sudo update-rc.d postgresql enable
```
</p>
</details>  

## Starting prime

```bash
npx primecms start
```

## Manual installation

Install the dependencies and create database

```bash
npm init
npm install -S @primecms/core @primecms/ui

createdb prime
```

Edit your `.env`:
```js
DATABASE_URL=postgresql://username@localhost:5432/prime
```
