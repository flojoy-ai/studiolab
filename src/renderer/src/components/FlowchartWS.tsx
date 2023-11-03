import { FC, useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Button } from './ui/Button'
import { Separator } from './ui/Separator'
import { Card } from './ui/Card'
import { ScrollArea } from './ui/ScrollArea'

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
      <ScrollArea>
        <span>The WebSocket is currently {connectionStatus}</span>
        {lastMessage ? <span> | Last message: {lastMessage.data}</span> : null}
        <Separator />
        <Button onClick={handleStart} disabled={readyState !== ReadyState.OPEN || adder !== undefined}>
          Start Flowchart
        </Button>
        <input
          type="file"
          accept={'.json'}
          onChange={(event): void => {
            const file = event!.target!.files![0]
            const reader = new FileReader()
            reader.onload = (event): void  => {
              const text = event!.target!.result
              setAdder(text as string)
            }
            reader.readAsText(file)
          }}
        ></input>
        <Separator />
        {adder !== undefined &&
          adder.blocks.map((block) => {
            if (block.block_type === 'slider') {
              return (
                <Card key={block.id}>
                  <h4>{block.id}</h4>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    onChange={(event) => handleSetSlider(event, block.id)}
                  />
                  <pre>
                    <code>{JSON.stringify(curFC.blocks.find((b) => b.id === block.id) || {})}</code>
                  </pre>
                </Card>
              )
            } else {
              return (
                <Card key={block.id}>
                  <h4>{block.id}</h4>
                  <pre>
                    <code>{JSON.stringify(curFC.blocks.find((b) => b.id === block.id) || {})}</code>
                  </pre>
                </Card>
              )
            }
          })}
      </ScrollArea>
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
