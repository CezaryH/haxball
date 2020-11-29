const express = require('express'); // Adding Express
const app = express(); // Initializing Express
const puppeteer = require('puppeteer'); // Adding Puppeteer

app.get('/', function(req, res) {
    let token = req.query.token;
    if(!token) {
        throw new Error('Provide token query param from https://www.haxball.com/headlesstoken')
    }
    puppeteer.launch().then(async function(browser) {
        const page = await browser.newPage();
        await page.goto('https://html5.haxball.com/headless');
        await page.evaluate(() => {
            var room = window.HBInit({
                roomName: "IGIP BEST ROOM",
                maxPlayers: 16,
                token: token,
                public: false,
                noPlayer: true // Remove host player (recommended!)
            });
            room.setDefaultStadium("Big");
            room.setScoreLimit(5);
            room.setTimeLimit(0);

            // If there are no admins left in the room give admin to one of the remaining players.
            function updateAdmins() {
                // Get all players
                var players = room.getPlayerList();
                if ( players.length === 0 ) return; // No players left, do nothing.
                if ( players.find((player) => player.admin) != null ) return; // There's an admin left so do nothing.
                room.setPlayerAdmin(players[0].id, true); // Give admin to the first non admin player in the list
            }

            room.onPlayerJoin = function(player) {
                updateAdmins();
            };

            room.onPlayerLeave = function(player) {
                updateAdmins();
            };


            const callback = function(mutationsList) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        let link = document.querySelector('a');
                        if(link) {
                            console.log(link.getAttribute('href'));
                        }
                    }
                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        });
    });
});

// Making Express listen on port 7000
app.listen(7000, function() {
    console.log('Running on port 7000.');
});
