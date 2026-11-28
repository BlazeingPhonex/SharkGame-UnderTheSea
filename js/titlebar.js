"use strict";
SharkGame.TitleBar = {
    saveLink: {
        name: "save",
        main: true,
        onClick() {
            try {
                SharkGame.Save.saveGame();
            } catch (err) {
                log.addError(err);
            }
            log.addMessage("Saved game.");
        },
    },

    optionsLink: {
        name: "options",
        main: true,
        onClick() {
            SharkGame.PaneHandler.showOptions();
        },
    },

    /*     helpLink: {
        name: "help",
        main: true,
        onClick() {
            SharkGame.PaneHandler.showHelp();
        },
    }, */

    skipLink: {
        name: "skip",
        main: true,
        onClick() {
            if (main.isFirstTime()) {
                // save people stranded on home world
                SharkGame.PaneHandler.showConfirmMenu(
                    "Reset Game",
                    "Are you sure you would like to reset your game?<br>You will lose <strong>ALL</strong> progress.",
                    "reset",
                    "do not reset",
                    main.resetGame,
                );
            } else {
                SharkGame.PaneHandler.showConfirmMenu(
                    "Skip World",
                    "If a world is causing you too much trouble, you can go back to the gateway.<br>Want to go back to the gateway?",
                    "go to gateway",
                    "stay here",
                    () => {
                        SharkGame.wonGame = false;
                        main.endGame();
                    },
                );
            }
        },
    },

    funFactsLink: {
        name: "fun fact",
        main: false,
        onClick() {
            SharkGame.FunFacts.showFact();
        },
    },

    changelogLink: {
        name: "changelog",
        main: false,
        onClick() {
            SharkGame.PaneHandler.showChangelog();
        },
    },

    /* creditsLink: {
        name: "credits",
        main: false,
        onClick() {
            SharkGame.PaneHandler.addPaneToStack("Credits", SharkGame.Panes.credits);
        },
    }, */ // credits now at bottom of page

    donateLink: {
        name: "donate",
        main: false,
        onClick() {
            SharkGame.PaneHandler.addPaneToStack("Donate", SharkGame.Panes.donate);
        },
    },

    wikiLink: {
        name: "wiki",
        main: false,
        link: "wiki/",
    },

    discordLink: {
        name: "discord",
        main: false,
        onClick() {
            const discordUrl = "https://discord.gg/eYqApFkFPY";
            SharkGame.PaneHandler.showConfirmMenu(
                "Leaving Shark Game",
                "Clicking on this will open a new tab to the link:<br><strong>" + discordUrl + "</strong>",
                "visit site",
                "go back",
                () => window.open(discordUrl, "_blank"),
            );
        },
    },

    hubLink: {
        name: "back to hub",
        main: false,
        onClick() {
            SharkGame.PaneHandler.showConfirmMenu(
                "Back to Hub",
                "Clicking on this will take you off of the game, you may lose unsaved progress.",
                "proceed",
                "keep sharking",
                () => {
                    try {
                        SharkGame.Save.saveGame();
                    } catch (err) {
                        log.addError(err);
                    }
                    log.addMessage("Saved game.");
                    window.location.href = "https://shark.tobot.dev/";
                },
            );
        },
    },

    /* noticeLink: {
        name: "notice",
        main: false,
        onClick() {
            SharkGame.PaneHandler.addPaneToStack("v0.2 OPEN ALPHA NOTICE", SharkGame.Panes.notice);
        },
    }, */
};

SharkGame.TitleBarHandler = {
    init() {
        SharkGame.TitleBarHandler.wipeTitleBar();
    },

    correctTitleBar() {
        if (main.isFirstTime()) {
            SharkGame.TitleBar.skipLink.name = "reset";
        } else {
            // and then remember to actually set it back once it's not
            SharkGame.TitleBar.skipLink.name = "skip";
        }
        this.setUpTitleBar();
    },

    updateTopBar() {
        if (SharkGame.Settings.current.minimizedTopbar) {
            document.querySelector("body").classList.add("top-bar");
            $("#wrapper").removeClass("notMinimized");
            $("#tabList").removeClass("notFixed");
        } else {
            document.querySelector("body").classList.remove("top-bar");
            $("#wrapper").addClass("notMinimized");
            $("#tabList").addClass("notFixed");
        }
    },

    wipeTitleBar() {
        $("#titlemenu").empty();
        $("#subtitlemenu").empty();
    },

    setUpTitleBar() {
        const titleMenu = $("#titlemenu");
        const subTitleMenu = $("#subtitlemenu");
        SharkGame.TitleBarHandler.wipeTitleBar();
        $.each(SharkGame.TitleBar, (linkId, linkData) => {
            let option;
            if (linkData.link) {
                option = "<li><a id='" + linkId + "' href='" + linkData.link + "' target='_blank'>" + linkData.name + "</a></li>";
            } else {
                option = "<li><a id='" + linkId + "' href='javascript:;'>" + linkData.name + "</a></li>";
            }
            if (linkData.main) {
                titleMenu.append(option);
            } else {
                subTitleMenu.append(option);
            }
            $("#" + linkId).on("click", linkData.onClick);
        });
    },
};
