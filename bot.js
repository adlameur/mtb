const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const autoeat = require('mineflayer-auto-eat').plugin

// --- CONFIGURATION ---
const config = {
  host: 'dynamic-8.magmanode.com', // PUT YOUR SERVER IP HERE
  port: 25815,
  username: 'MTB_SLAVE',       // Name: MTB_SLAVE
  version: '1.21',             // LOCKED to version 1.21
  owner: 'Adel Ameur'          // Only obeys you
}

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
    // If your server is Premium (not cracked), uncomment the line below:
    // auth: 'microsoft' 
  })

  // Load plugins
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(autoeat)

  bot.on('login', () => {
    console.log(`${bot.username} logged in on version 1.21`)
  })

  bot.on('spawn', () => {
    const defaultMove = new Movements(bot)
    // 1.21 specific movement tweaks (optional but helps stability)
    defaultMove.canDig = false // Set to true if you want him to break blocks to get to you
    
    bot.pathfinder.setMovements(defaultMove)
    bot.chat('MTB SLAVE online. Version 1.21. Awaiting orders.')
  })

  // --- AUTO EAT (SURVIVAL) ---
  bot.on('autoeat_started', () => {
    console.log('Eating food...')
  })

  bot.on('health', () => {
    if (bot.food === 20) bot.autoEat.disable()
    else bot.autoEat.enable()
  })

  // --- CHAT COMMANDS ---
  bot.on('chat', (username, message) => {
    if (username !== config.owner) return

    const target = bot.players[username]?.entity

    // "come"
    if (message === 'come') {
      if (!target) {
        bot.chat("I can't see you!")
        return
      }
      bot.chat('Moving to your location.')
      const { GoalFollow } = goals
      bot.pathfinder.setGoal(new GoalFollow(target, 1), true)
    }

    // "stop"
    if (message === 'stop') {
      bot.chat('Stopping.')
      bot.pathfinder.setGoal(null)
    }

    // "drop"
    if (message === 'drop') {
        bot.chat("Dropping inventory.")
        const items = bot.inventory.items()
        for (const item of items) {
            bot.tossStack(item)
        }
    }
    
    // "mount" (Sit in nearest boat/minecart)
    if (message === 'mount') {
        const vehicle = bot.nearestEntity((entity) => {
            return entity.name === 'boat' || entity.name === 'minecart'
        })
        if (vehicle) {
            bot.mount(vehicle)
        } else {
            bot.chat("No vehicle nearby.")
        }
    }
  })

  bot.on('kicked', console.log)
  bot.on('error', console.log)
  
  bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 10s...')
    setTimeout(createBot, 10000)
  })
}

createBot()