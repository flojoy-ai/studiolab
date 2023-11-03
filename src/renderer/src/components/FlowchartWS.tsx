import { FC, useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

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

  const [adderJSON, setAdder] = useState<string>('')

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState]

  useEffect(() => {
    if (connectionStatus === 'Open' && adderJSON !== '') {
      sendMessage(JSON.stringify(adder))
    }
  }, [connectionStatus, adderJSON])

  const adder = adderJSON !== '' ? JSON.parse(adderJSON) : undefined
  const handleStart = (): void => {
    sendMessage('start')
  }

  return (
    <>
      <div>
        <button onClick={handleStart} disabled={readyState !== ReadyState.OPEN}>
          Start Flowchart
        </button>
        <label htmlFor="file">Upload a flowchart</label>
        <input
          type="file"
          accept={'.json'}
          onChange={(event) => {
            const file = event.target.files[0]
            const reader = new FileReader()
            reader.onload = (event) => {
              const text = event.target.result
              setAdder(text as string)
            }
            reader.readAsText(file)
          }}
        ></input>
        <span>The WebSocket is currently {connectionStatus}</span>
        {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
        {adder !== undefined && adder.blocks.map((block) => {
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
