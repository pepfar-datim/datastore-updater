# Data Store Updater

Data Store Updater app for DATIM

## Set up for local development

### Step 1: Setup the dhis.json config file
To get started clone the repository and add a `dhis.json` file to the root of the project. This will help gulp determine where your dhis2 instance is running and will make it easier to deploy the app. Additionally it will also update the webapp manifest for you so you do not have to install the app.

The dhis.json file should look something like the following.
The `dhisBaseUrl` is the url for the manifest. This is the address you use in your browser.
The `dhisDeployDirectory` is the directory on disk where the app should be copied to. (Note the last folder being the app folder. This folder is the app installation folder as defined in the dhis app management settings module + the name of the app.)

```json
{
    "dhisBaseUrl": "http://localhost:8080/dhis",
    "dhisDeployDirectory": "/usr/local/tomcat/webapps/DHIS2_HOME/apps/datastore-updater/"
}
```

### Step 2: Install the dependencies
We make use of some tools to build the application, that you would need to install before being able to do any of the commands needed. You need to run `nodejs` or `io.js` and have `bower` and `gulp` installed as global modules. Additionally to pre-process the sass files to css you need to have `sass` for `ruby` installed as well. All these can be installed using the following commands.

```bash
### Step:3 Install bower for dependency management
npm install -g bower

# Install gulp to run build tasks
npm install -g gulp

# You might have to use sudo to install the ruby gem.
gem install sass 
#or
sudo gem install sass 
```

Run the following command to install the nodejs dependencies (This requires you to have nodejs installed)
```bash
npm install
```

Install the bower dependencies
```bash
bower install
```

Run the gulp build command to see if everything is installed correctly
```bash
gulp build
```

After running `gulp copy-to-dev` your app should be available at `http://localhost:8080/dhis/datastore-updater` if your settings are the same as above.