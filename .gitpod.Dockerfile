FROM gitpod/workspace-full:latest

RUN bash -c 'VERSION="14.19.1"     && source $HOME/.nvm/nvm.sh && nvm install $VERSION     && nvm use $VERSION && nvm alias default $VERSION'

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

# TODO - install tools for Static Web Apps development.
#RUN bash -c npm install -g @azure/static-web-apps-cli azure-functions-core-tools@3 --unsafe-perm true
