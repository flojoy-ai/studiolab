import { FC, useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

const adder: FlowChart = JSON.parse(
  '{\n' +
    '  "blocks": [\n' +
    '    {\n' +
    '      "block_type": "slider",\n' +
    '      "id": "slider1",\n' +
    '      "ins": [],\n' +
    '      "outs": [\n' +
    '        {\n' +
    '          "source": "slider1",\n' +
    '          "target": "add1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "x"\n' +
    '        }\n' +
    '      ]\n' +
    '    },\n' +
    '     {\n' +
    '      "block_type": "constant",\n' +
    '      "id": "constant1",\n' +
    '      "ins": [],\n' +
    '      "outs": [\n' +
    '        {\n' +
    '          "source": "constant1",\n' +
    '          "target": "add1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "y"\n' +
    '        }\n' +
    '      ]\n' +
    '    },' +
    '    {\n' +
    '      "block_type": "add",\n' +
    '      "id": "add1",\n' +
    '      "ins": [\n' +
    '        {\n' +
    '          "source": "slider1",\n' +
    '          "target": "add1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "x"\n' +
    '        },\n' +
    '        {\n' +
    '          "source": "constant1",\n' +
    '          "target": "add1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "y"\n' +
    '        }\n' +
    '      ],\n' +
    '      "outs": [\n' +
    '        {\n' +
    '          "source": "add1",\n' +
    '          "target": "bignum1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "x"\n' +
    '        }\n' +
    '      ]\n' +
    '    },\n' +
    '    {\n' +
    '      "block_type": "bignum",\n' +
    '      "id": "bignum1",\n' +
    '      "ins": [\n' +
    '        {\n' +
    '          "source": "add1",\n' +
    '          "target": "bignum1",\n' +
    '          "sourceParam": "value",\n' +
    '          "targetParam": "x"\n' +
    '        }\n' +
    '      ],\n' +
    '      "outs": []\n' +
    '    }\n' +
    '  ]\n' +
    '  }'
) as FlowChart

export const FlowchartWS: FC = () => {
  const socketURL = 'ws://localhost:2333/blocks/flowchart'
  const [curFC, setCurFC] = useState<any>({ blocks: [] })
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketURL)

  useEffect(() => {
    if (lastMessage !== null) {
      const jsonMsg = lastMessage.data.replace(/'/g, '"')
      console.log('GOT MESSAGE: ' + jsonMsg)
      const msgObg = JSON.parse(jsonMsg)
      const new_fc = { ...curFC }.blocks.filter((block) => block.id !== msgObg.id)
      new_fc.push(msgObg)
      setCurFC({ blocks: new_fc })
    }
  }, [lastMessage, setCurFC])

  const handleSetSlider = (event, slider_id): void => {
    const value = event.target.value
    sendMessage(
      JSON.stringify({
        __discriminator: 'FCUIFeedback',
        id: slider_id,
        value: value
      })
    )
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState]

  useEffect(() => {
    if (connectionStatus === 'Open') {
      sendMessage(JSON.stringify(adder))
    }
  }, [connectionStatus])

  const handleStart = (): void => {
    sendMessage('start')
  }

  return (
    <>
      <div>
        <button onClick={handleStart} disabled={readyState !== ReadyState.OPEN}>
          Start Flowchart
        </button>
        <span>The WebSocket is currently {connectionStatus}</span>
        {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
        {adder.blocks.map((block) => {
          if (block.block_type === 'slider') {
            return (
              <div key={block.id}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  onChange={(event) => handleSetSlider(event, block.id)}
                />
                <pre>
                  <code>{JSON.stringify(curFC.blocks.find((b) => b.id === block.id) || {})}</code>
                </pre>
              </div>
            )
          } else {
            return (
              <pre key={block.id}>
                <code>{JSON.stringify(curFC.blocks.find((b) => b.id === block.id) || {})}</code>
              </pre>
            )
          }
        })}
      </div>
    </>
  )
}

interface BlockConnection {
  source: string
  target: string
  sourceParam: string
  targetParam: string
}
interface FCBlock {
  id: string
  block_type: 'slider' | 'gamepad' | 'button' | 'bignum' | 'add' | 'subtract'
  ins: Array<BlockConnection>
  outs: Array<BlockConnection>
}

interface FlowChart {
  blocks: Array<FCBlock>
}
