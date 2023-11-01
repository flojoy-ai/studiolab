import {FC, useCallback, useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
const adder: FlowChart = {blocks: [{
    block: "slider",
    id: "slider1",
    ins: [],
    outs: [{
      source: "slider1",
      target: "add1",
      sourceParam: "value",
      targetParam: "x"
    }]
  },
    {
      block: "slider",
      id: "slider2",
      ins: [],
      outs: [{
        source: "slider2",
        target: "add1",
        sourceParam: "value",
        targetParam: "y"
      }]
    },
    {
      block: "add",
      id: "add1",
      ins: [{
        source: "slider1",
        target: "add1",
        sourceParam: "value",
        targetParam: "x"
      },
        {
          source: "slider2",
          target: "add1",
          sourceParam: "value",
          targetParam: "y"
        }],
      outs: [{
        source: "add1",
        target: "bignum1",
        sourceParam: "value",
        targetParam: "value"
      }]
    },
    {
      block: "bignum",
      id: "bignum1",
      ins: [{
        source: "add1",
        target: "bignum1",
        sourceParam: "value",
        targetParam: "value"
      }],
      outs: []
    }
  ]}

export const FlowchartWS: FC = () => {
  // const initURL = 'http://localhost:2333/blocks/setup_flowchart'
  const socketURL = 'ws://localhost:2333/blocks/nodes'
  const [messageHistory, setMessageHistory] = useState<any>([])
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketURL)

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage))
    }
  }, [lastMessage, setMessageHistory])

  const handleClickSendMessage = useCallback(() => sendMessage('hello wrold'), [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState]

  return (
    <>
    <code>
      <pre>
        {JSON.stringify(adder, null, 2)}
      </pre>
    </code>
    <div>
      <button onClick={handleClickSendMessage} disabled={readyState !== ReadyState.OPEN}>
        Click Me to send 1
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
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
  block: 'slider' | 'gamepad' | 'button' | 'bignum' | 'add' | 'subtract'
  ins: Array<BlockConnection>
  outs: Array<BlockConnection>
}

interface FlowChart {
  blocks: Array<FCBlock>
}

