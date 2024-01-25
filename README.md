# Chat Conductor

Chat conductor project. This is a project aimed at providing a quick generative AI pipeline prototyping.

The backend of this project is [Chat Composer](https://github.com/LioQing/chat-composer/).

## Demo Video

https://github.com/LioQing/chat-conductor/assets/46854695/97632909-88c6-4e0f-9366-613e7d7bd528

## Current Features

User feature:
- Create containerized pipeline project
- Call supported generative AI services (currently support Azure OpenAI Chat Completion, Google Vertex AI Gemini Pro)
- Download project files
- Integrate Chat Conductor API into your own project

Admin feature:
- Create and whitelist user
- Monitor user token usage on supported generative AI services

## Environment Setup

### Node.js and npm

We use Node.js 18.17 and npm 9.6, so make sure you have that installed.

You could use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows is not recommended to install pyenv because it does not get native support) to manage your Node.js and npm versions.

Install the Node.js version you want to use, which also installs the npm.

```bash
nvm install <version>
```

Specify the version for you are going to use.

```bash
nvm use <version>
```

To check your Node.js and npm version, run `node --version` and `npm --version` respectively in your terminal.

```bash
node --version
npm --version
```

### Environment Variables

Make a copy of the `.env.example` file and rename it to `.env`.

```bash
cp .env.example .env
```

Fill in the environment variables in the `.env` file.

### Install Dependencies

Install the dependencies for the project.

```bash
npm install
```

### Lint and Pre-commit

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) for the coding style and guidelines. The style is then enforced by [Husky](https://typicode.github.io/husky/#/) and [lint-staged](https://github.com/lint-staged/lint-staged).

Finish the environment setup above (especially installing the dependencies with npm) before proceeding.

Install and setup the pre-commit hooks.

```bash
npm run pre-commit
chmod +x .husky/pre-commit
```

To run linting manually (only scans staged files).

```bash
npx lint-staged
```

Remember to stage files again if there are any changes made by the pre-commit hooks or by you.

```bash
git add .
```

### VS Code Settings

You can add a workspace setting to automatically format your code on save using the black formatter.

You need to have the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint) extensions installed.

Bring up the command palette with Ctrl+Shift+P(Windows/Linux) / Cmd+Shift+P(Mac) and search for "Preferences: Open Workspace Settings (JSON)".

Then replace the content with the following:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript][typescript][javascriptreact][typescriptreact][json][css][html]": {
    "editor.tabSize": 2
  }
}
```

## Development

### Clone Repository

First clone the repository.

```bash
git clone git@github.com:<username>/<repository>.git
```

**Important**: You may need to setup SSH keys for your GitHub account. See [this guide](https://help.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh) for more information.

### Checkout Branch

Then checkout the branch you want to work on.

```bash
git checkout <branch>
```

### Committing Changes

Commit your changes to the branch you are working on.

```bash
git add .
git commit -m "Your commit message"
```

Make any changes and stage your files again according to the pre-commit hooks.

### Pushing Changes

Set your branch's upstream branch to be the same branch on the remote repository on GitHub.

```bash
git push -u origin <branch>
```

After the first time you set the upstream branch, you can simply push without specifying the branch.

```bash
git push
```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
