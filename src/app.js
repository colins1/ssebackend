import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

const users = []

const clients = new Set()

function addUser (userName) {
  if (!users.includes(userName)) {
    users.push(userName)
    return true
  }

  return false
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const json = JSON.parse(data)
    switch (json.event) {
      case 'addUser': {
        const add = addUser(json.userName)
        let result

        if (!add) {
          result = false
        } else {
          result = true
        }

        clients.add(ws)

        for (const client of clients) {
          client.send(JSON.stringify({
            event: 'addUser',
            userName: json.userName,
            result
          }))
        }
        break
      }
      case 'getUserList':
        ws.send(JSON.stringify({
          event: 'getUserList',
          userList: users
        }))
        break

      case 'sendMessage':
        for (const client of clients) {
          client.send(JSON.stringify({
            event: 'sendMessage',
            userName: json.userName,
            time: Date.now(),
            message: json.message
          }))
        }
    }
    ws.on('close', (ws) => {
      users.splice(users.indexOf(json.userName), 1)

      clients.delete(ws)

      for (const client of clients) {
        client.send(
          JSON.stringify({
            event: 'getUserList',
            userList: users
          })
        )
      }
    })

    clients.add(ws)
  })
})
