import mineflayer from 'mineflayer'
import { pathfinder, Movements, goals } from 'mineflayer-pathfinder'
import { plugin as autoeat } from 'mineflayer-auto-eat'

// --- CONFIGURATION ---
const config = {
  host: 'dynamic-8.magmanode.com', // PUT YOUR SERVER IP HERE
  port: 25815,
  username: 'MTB_SLAVE',       
  version: '1.21',             
  owner: 'Adel Ameur',         
  
  // AuthMe Password (leave empty if not needed)
  auth_password: 'changeme123' 
}

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  })

  // Load plugins
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(autoeat)

  bot.on('login', () => {
    console.log(`${bot.username} joined.`)
  })

  bot.on('spawn', () => {
    // 1. AUTO LOGIN LOGIC
    if (config.auth_password) {
        setTimeout(() => {
            bot.chat(`/register ${config.auth_password} ${config.auth_password}`)
            bot.chat(`/login ${config.auth_password}`)
        }, 1500) 
    }

    // 2. MOVEMENT SETUP
    const defaultMove = new Movements(bot)
    defaultMove.canDig = false 
    bot.pathfinder.setMovements(defaultMove)
    
    // 3. ANNOUNCE
    setTimeout(() => {
        bot.chat('MTB SLAVE is online (ESM Mode).')
    }, 3000)
  })

  // --- AUTO EAT ---
  bot.on('autoeat_started', () => { console.log('Eating...') })
  bot.on('health', () => {
    if (bot.food === 20) bot.autoEat.disable()
    else bot.autoEat.enable()
  })

  // --- COMMANDS ---
  bot.on('chat', (username, message) => {
    if (username !== config.owner) return
    const target = bot.players[username]?.entity

    if (message === 'come') {
      if (!target) return
      bot.chat('Coming.')
      const { GoalFollow } = goals
      bot.pathfinder.setGoal(new GoalFollow(target, 1), true)
    }

    if (message === 'stop') {
      bot.chat('Stopping.')
      bot.pathfinder.setGoal(null)
    }
    
    if (message === 'twerk') {
        bot.chat('Getting sturdy.')
        let interval = setInterval(() => {
            bot.setControlState('sneak', true)
            setTimeout(() => bot.setControlState('sneak', false), 200)
        }, 400)
        setTimeout(() => clearInterval(interval), 5000)
    }

    if (message === 'drop') {
        bot.chat("Dropping inventory.")
        const items = bot.inventory.items()
        for (const item of items) {
            bot.tossStack(item)
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
