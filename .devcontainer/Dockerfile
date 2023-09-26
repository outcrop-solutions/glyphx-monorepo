FROM archlinux:latest
RUN pacman-key --init
RUN pacman -Sy archlinux-keyring --noconfirm
RUN pacman -Syu --noconfirm --disable-download-timeout
RUN pacman -Sy core/which --noconfirm
RUN pacman -Sy vi --noconfirm
RUN pacman -Sy fish --noconfirm
RUN pacman -Sy sudo --noconfirm
RUN pacman -Sy python --noconfirm
RUN pacman -Sy make --noconfirm
RUN pacman -Sy base-devel --noconfirm
RUN pacman -Sy libx11 --noconfirm
RUN pacman -Sy pciutils --noconfirm
RUN pacman -Sy neofetch --noconfirm
RUN pacman -Sy exa --noconfirm
RUN pacman -Sy neovim --noconfirm
RUN pacman -S python-pynvim --noconfirm
RUN pacman -Sy nodejs npm typescript --noconfirm 


