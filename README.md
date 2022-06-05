# MULE - Maynooth University Learning Environment
MULE is the platform that allows to start learning programming immediately, in a browser, without the need to install any software.

## Overview
The service consists of 3 parts (containers or services):
 - `rethinkdb` - the database for persisting user data
 - `lass` - additional service that serves as an proxy-interface for communication with the database
 - `mule` - the MULE itself, it's basically [OS.js](https://demo.os-js.org/) with some additional apps
 
It's highly recommended to familiarize yourself with [OS.js Documentation](https://manual.os-js.org/) before starting development.

## Development
Before starting to develop you should be familiar with [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) and both should be installed on your machine.

### Running the development environment
The first thing to do after pulling the repository is to copy `.env_example` file into `.env` and `docker-compose-example.yaml` into `docker-compose.yaml`.
You can do this by running the following commands in the root folder of the project:
```bash
cp .env_example .env
cp docker-compose-example.yaml docker-compose.yaml
```

The next step is to adjust the `.env` file, here is the explanation of each variable present in the file:
 - `CONTAINER_UID` - ID of the user that runs the apps as (see usage in docker-compose.yaml)
 - `CONTAINER_GID` - group ID of the user that runs the apps as (see usage in docker-compose.yaml)
 - `JWT_SECRET` - secret used for JWT authentication
 - `JWT_KEY` - key used for JWT authentication
 - `LTI_SECRET` - secret used for LTI authentication
 - `LTI_KEY` - key used for LTI authentication
 - `OSJS_SECRET` - secret used for protecting OS.js session
 - `CEE_BASE_URL` - http address of the code execution engine (CEE)
 - `CEE_BASE_WS` - WebSocket address of the CEE
 - `CEE_TYPE` - code execution engine type (`cee` or `jail`)
 - `CEE_DATA_FORMAT` - data format that the CEE should use, `json` or `xml` (`json` is available for `cee` only)
 - `CEE_MAX_MEMORY` - the maximum amount of memory (bytes) an execution can use, limited by the CEE upper limit
 - `CEE_LANGUAGES` - map of file extensions to language names (comma-separated list of `{file_extension}:{language_name}` pairs), used for detecting the programming language used
 - `CEE_RUNNERS` - map of language names to runners (comma-separated list of `{language_name}:{runner_name}` pairs), used for detecting what runner(environment, compiler version, etc) to use for code execution
 - `NODE_TLS_REJECT_UNAUTHORIZED` - Allow or deny connections without unauthorized certificate
 - `SECURE_COOKIES` - `true` for `https`, `false` for `http` (e.g. localhost), default - `true`
 
You can leave all of the secrets and keys as they are or you can set them to be any strings you choose. It is not necessary to surround the string variables in quotation marks.
The `CEE_BASE_URL` and `CEE_BASE_WS` variables should also be set to allow code execution (note `CEE_TYPE` and `CEE_DATA_FORMAT` should be set accordingly).

After the configuration of the .env file is complete, you just have to run the command below to start the service:
```bash
docker-compose up -d
```

### Accessing MULE from your browser
Then you can go to http://localhost to check if the service works. You should see "Welcome to MULE" message as well as an additional message asking to login.
To login you can open `.login/index.html` file in a browser, adjust `secret` and `oauth_consumer_key` fields, click on `Build Login Request` and then on `Login with LTI`.
If you have issues logging in at this point, you can check the environment variables within the mule docker container.

Next, copy the `default-course-config.json` from /mule-system2/mule/storage to vfs folder within storage. Then create a new folder in storage related to the `tool_consumer_instance_guid` value (e.g. if tool_consumer_instance_guid: "2020.localhost", create a folder called 2020.localhost). Navigate into this folder and create another folder related to the course id which is the value for context_id (e.g. if "context_id": "0000", then create a folder called 0000). Finally, copy the config file with the name `config.json` to this location. This is needed as the config file was moved from vfs to storage with Commit 42c07457.

### Watching, Rebuilding & Restarting MULE
From the box, everything except the `mule/src/packages` folder is watched, rebuilt and relaunched if needed.
For example, if you make some changes to the client side of MULE, the new version will be available immediately after you reload the page in the browser.
In case you update something on the server side, the server will automatically restart and the very next request will be processed using the latest changes.

However, every MULE app in the `mule/src/packages` should be watched and built separately. You can do this by logging into the container and running `npm run watch` in each app's folder.
After you started watching a specific app, every time you make changes to that app, they will be immediately applied.

The only thing to keep in mind is that by default(default config of `mule` container in docker-compose.yaml), the apps are NOT loaded from your filesystem but from the container layer.
To load the files from the filesystem, you should comment the `/home/node/app/src/packages` line in the `volumes` section of the `mule` container.
It is also recommended to still load each app dependencies from a container and keep the built files in the container.
For this purpose, just add the following two lines for each app to the `volumes` section:
 - `/home/node/app/src/packages/{APP_NAME}/node_modules`
 - `/home/node/app/src/packages/{APP_NAME}/dist`

where `APP_NAME` is the name of the app folder (e.g. `editor`, `terminal`, etc).
To apply the changes made to `docker-compose.yaml` file, run `docker-compose down` and then `docker-compose up -d`.

### Container registry
After you made some changes to the source code and you are satisfied with the result you will commit the changes and push them to the git repository.
But after this to make them available to the users you also have to rebuild the containers and push them to a remote repository.
To rebuild the containers you can run the following command from the root folder of the project:
```bash
 docker-compose build
```
or you can build one container separately (e.g. `mule`):
```bash
 docker build -f docker/mule/Dockerfile -t {CONTAINER_REGISTRY_ACCOUNT_USERNAME}/mule:{VERSION} .
```
To push a container to a remote repository you should run the command below:
```bash
 docker push {CONTAINER_REGISTRY_ACCOUNT_USERNAME}/mule:{VERSION}
```

## Deployment
To start deployment you should have [kubectl](https://kubernetes.io/docs/reference/kubectl/overview/) installed and configured to access your K8S cluster.
You can use a local cluster as well as a remote one (e.g. AWS, Google Cloud, etc).

Before starting the deployment you have to make a local copy of all the deployment files to be able to make any changes if needed.
The deployment files are placed into `k8s` folder. Copy them into `k8s/.current`.

There are basically 3 steps to deploy the project to a K8S cluster:
 1) Deploy the metric server (if not deployed yet) which is used for tracking resource usage (it is needed for auto-scaling).
 
    While deploying to a local cluster it may be necessary to disable TLS verification by commenting out the `--kubelet-insecure-tls` argument for the `metrics-server` Deployment, see the `k8s/.current/metrics-server.yaml` file.
    ```bash
     kubectl apply -f k8s/.current/metrics-server.yaml
    ```
    
 2) Deploy the K8S dashboard (if not deployed yet) for viewing all the deployments, resource usage, etc.
 
    ```bash
     kubectl apply -f k8s/.current/dashboard.yaml
    ```
    To access the dashboard we need to use K8S Proxy, in other words just run:
    ```bash
     kubectl proxy
    ```
    In the output we will see the address the K8S API is available at.
    Enter the outputted address and add the `/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/` path, then hit enter.
    You will see an authorization dialog. To login with a token we should obtain it first. That can be done by running the following command:
    ```bash
     kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
    ```
    Copy the printed token and paste it into the authorization dialog and click on `Sign in`.
    Now you should see all the parts of the K8S cluster, including the MULE app that is going to be deployed in the next step.
    
 3) Deploy the app itself.
 
    The `k8s/.current/kustomization.yaml` is the file that brings all the parts together.
    You can explore all the components to see what each is responsible for.
    However, the `k8s/.current/secrets.yaml` should be modified to set mule secrets (e.g. `jwt_secret`, `lti_secret`, etc) and container registry secret.
    Talking about mule secrets, you just have to generate and base64 encode each, then put into `mule-secrets` secret.
    With the `container-registry-secret` secret the situation is a bit different.
    You have to run the following command (after replacing the placeholders), copy the value of the `.dockerconfigjson` output field and paste it into the same field in the `container-registry-secret`.
    ```bash
     kubectl create secret docker-registry dockerhub-secret \
     	--dry-run=client \
         --docker-server={REGISTRY_SERVER_URL} \
         --docker-username={USERNAME} \
         --docker-password='{PASSWORD}' \
         --docker-email={USER_EMAIL_ADDRESS} -o yaml
    ```
    Depending on the cluster, you also have to configure persistent storage. The `k8s/.current/storage/local` folder contains the `PersistentVolumes` and `PersistentVolumeClaims` that can be used for deploying the app to a local cluster.
    If you're going to deploy the service to AWS or any other remote K8S cluster you will have to provide separate `PersistentVolumes` and `PersistentVolumeClaims`.
    More information about providing persistent storage can be found [here](https://v1-16.docs.kubernetes.io/docs/concepts/storage/persistent-volumes/).
    
    As soon as the secrets and volumes are configured you can run the following command to deploy MULE to the cluster:
    ```bash
     kubectl apply -k k8s/.current
    ```

## Auto-scaling
Out of 3 services MULE consists of, only `mule` and `lass` are using horizontal auto-scaling(adding more replicas on demand).
Configurations of the `Deployment`, `Service`, and `HorizontalPodAutoscaler` for `mule` and `lass` are present in the `k8s/.current/apps/mule.yaml` and `k8s/.current/apps/lass.yaml` files respectively.
For sure, after deployment of the service you will have to modify `HorizontalPodAutoscaler` parameters for both `mule` and `lass` to get the best performance and use minimum resources.

On the other hand, `rethinkdb` is a database and its scaling requires to shard the database which is at the current load of the service not necessary.
This way we just have to provide this `Deployment` with enough resources (CPU, Memory) to handle all the requests.
Configuration of the `Deployment`, `Service` for `rethinkdb` is present in the `k8s/.current/apps/rethinkdb.yaml` file.