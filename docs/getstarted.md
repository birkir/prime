# Get Started

Getting Started is easy, there are not many requirements.

## Requirements

 - PostgreSQL 9.4+
 - Node (Active LTS)

## Installing

### Mac OS X

Install brew
```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Install postgresql and node
```bash
brew install node postgresql
brew services start postgresql
```

### Windows

 - [Download NodeJS](https://nodejs.org/en/)
 - [Download PostgreSQL](https://www.postgresql.org/download/windows/)

### Linux (Ubuntu/debian)

```bash
sudo apt-get install -y postgresql nodejs
sudo update-rc.d postgresql enable
```

## Quick start

Start by creating a folder containing your Prime installation
```bash
mkdir prime
cd prime
```

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

Start Prime
```bash
npx primecms
```
