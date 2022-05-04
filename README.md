## Regat: Integration System
Regat is an integration system which integrates 3 external systems. The 3 external systems are Opsgenie, AWX, and GitHub.
With the help of Regat, those 3 external systems can be connected to each other.

Regat uses [Node.js](https://nodejs.org) as runtime environment and [NestJS](https://github.com/nestjs/nest) as framework.

## Installation
To install regat, run the command below.
```bash
$ npm install
```

## Database
Regat use sequelize to connect to PostgreSQL database. Here are the [manual](https://sequelize.org/master/manual/migrations.html) for [sequelize](https://sequelize.org/master/index.html).
To change anything in the database we can use sequelize migration.
To make a sequelize migration file we can use the command below.
```bash
npx sequelize-cli migration:generate --name <migration-file-name>
```
This command will generate a file under `src/database/migrations`
After the file is created, we can edit the file to make changes to the database.
Then to execute the changes we can run this command in the project root.
```bash
npx sequelize-cli dg:migrate
```
To undo the migration use this command.
```bash
npx sequelize-cli dg:migrate:undo
```
All of these command can also be executed in Regat's running container in production.
Just make sure the directory is `/dist`.

## Running Regat

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test
These are the commands to run some tests. Currently, there is no test to run.
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Continuous Deployment
Regat uses GitHub Action to create a Docker Image and push it to hub.docker.com repository when a new release is published. To make a new release, here are the steps:
1. In `<> Code` tab, go to a Release section, and there will be a `+ n release` button. Click the button.
2. We will be in the Releases page. Find the `Draft a new release` button and click on it.
3. Choose a tag for the release.
4. Write the title and description for the release.
5. Click `Publish release` button to publish the release.
6. Go to `Actions` tab in the repository.
7. Click on the running workflow, which is building and pushing image to hub docker repository.
8. If the workflow run successfully, it means the image is already pushed to hub docker.
