# Upgrading

We will try to keep up with Kohana's releases but we will always depend on latest stable release of Kohana.

## Upgrading using Git

    git pull origin 3.3/master
    cat schema/prime-mysql.sql

Review the schema and update needed columns.

## Upgrade by downloading latest release

1. Download latest upgrade release from github
2. Extract all files to modules/prime/.
3. Run the upgrade sql file from **schema/upgrade/prime-(FROM)_(TO)-mysql.sql
4. All done