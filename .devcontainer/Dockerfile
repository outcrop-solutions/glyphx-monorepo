FROM mcr.microsoft.com/devcontainers/universal:2
RUN apt-get update -y
RUN apt-get install -y fish pciutils neofetch 
RUN npm install -g typescript pnpm
RUN pip install pynvim
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN /bin/bash -c "source ~/.cargo/env" 
RUN ~/.cargo/bin/cargo install --root /usr/local exa
RUN curl -L https://github.com/neovim/neovim/releases/download/v0.9.2/nvim-linux64.tar.gz > nvim-linux64.tar.gz
RUN tar xzvf nvim-linux64.tar.gz
