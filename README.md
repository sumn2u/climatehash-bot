
# Build your own Bluesky bot 🦋

This is a template repo for building [Bluesky](https://bsky.app/) bots that post on their own schedule. It uses [TypeScript](https://www.typescriptlang.org/) to build the bot and [GitHub Actions](https://docs.github.com/en/actions) to schedule the posts.

* [How to use](#how-to-use)
  * [Things you will need](#things-you-will-need)
    * [A Bluesky account](#a-bluesky-account)
    * [Node.js](#nodejs)
  * [Clone the repository](#clone-the-repository)
  * [Running locally to test](#running-locally-to-test)
  * [Create your own posts](#create-your-own-posts)
  * [Deploy](#deploy)
    * [Schedule](#schedule)
    * [Environment variables](#environment-variables)
  * [Set it live](#set-it-live)


## How to use

### Things you will need

#### A Bluesky account

To use this repo you will need a [Bluesky account](https://bsky.app/). [Sign up for an invite here](https://bsky.app/).

Once you have an account for your bot, you will need to know your bot's handle and password (I recommend using an App Password, which you can create under your account's settings).

#### Node.js

To run this bot locally on your own machine you will need [Node.js](https://nodejs.org/en) version 18.16.0 or above.

### Clone the repository

To get started, simply clone the bot from the official repository:

```sh
git clone https://github.com/sumn2u/climatehash-bot.git
cd climatehash-bot
```

### Running locally to test

Follow these simple steps to run the Bluesky bot on your computer, whether you're using **Windows** or **Linux**.

#### 1. 🚀 Install Dependencies

Open a terminal or command prompt, and run:

```sh
npm install
```

This installs everything the bot needs to run.

#### 2. 🛠️ Set Up the Environment File

Copy the example `.env` file and rename it to `.env`.

- **Linux/macOS:**

```sh
cp .env.example .env
```

- **Windows (Command Prompt):**

```cmd
copy .env.example .env
```

Then open the `.env` file in a text editor (like Notepad or VS Code), and fill in your **Bluesky username** and **password**.

#### 3. 🧱 Build the Bot

Run this command to prepare the project:

```sh
npm run build
```

> 💡 **Optional:** Want the bot to send messages somewhere else?  
> Open `src/lib/bot.ts` and change the URL on **line 50**.

#### 4. ▶️ Run the Bot (Test Mode)

Run this to test the bot without making a real post:

```sh
npm run dev
```

If everything is set up correctly, you’ll see:

```
[TIMESTAMP] Posted: "Hello from the Bluesky API"
```

✅ This means the bot successfully connected but **did not post anything yet**.

#### 5. ✍️ Make a Real Post

To have the bot create a post on your Bluesky account:

1. Open `index.ts`
2. Go to **line 4**
3. Change this line by removing the `{ dryRun: true }` part:

```diff
- const text = await Bot.run(getPostText, { dryRun: true });
+ const text = await Bot.run(getPostText);
```

Then build and run the bot again:

```sh
npm run build
npm run dev
```

🎉 That’s it! The bot will now post to your Bluesky account.

### Create your own posts

Currently the bot calls on the function [`getPostText`](./src/lib/getPostText.ts) to get the text that it should post. This function returns the text "Hello from the Bluesky API" every time.

To create your own posts you need to provide your own implementation of `getPostText`. You can do anything you want to generate posts, the `getPostText` function just needs to return a string or a Promise that resolves to a string.

### Deploy

Once you have built your bot, the only thing left to do is to choose the schedule and set up the environment variables in GitHub Actions.

#### Schedule

The schedule is controlled by the GitHub Actions workflow in [./.github/workflows/post.yml](./.github/workflows/post.yml). The [schedule trigger](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) uses cron syntax to schedule when the workflow runs and your bot posts. [Crontab Guru](https://crontab.guru/) is a good way to visualise it.

For example, the following YAML will schedule your bot to post at 5:30 and 17:30 every day.

```yml
on:
  schedule:
    - cron: "30 5,17 * * *"
```

Be warned that many GitHub Actions jobs are scheduled to happen on the hour, so that is a busy time and may see your workflow run later than expected or be dropped entirely.

#### Environment variables

In your repo's settings, under *Secrets and variables* > *Actions* you need to enter two Secrets to match your `.env` file. One secret should be called `BSKY_HANDLE` and contain your Bluesky username, and the other should be called `BSKY_PASSWORD` and contain your App Password that you generated for the bot account.

### Set it live

Once the schedule is set up and your Environment variables configured, push your changes to your repo and wait for the schedule to trigger the workflow. Your bot will start publishing posts based on your code.
