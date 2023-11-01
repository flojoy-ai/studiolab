import {FC, useCallback, useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";

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
    <div>
      <button onClick={handleClickSendMessage} disabled={readyState !== ReadyState.OPEN}>
        Click Me to send 1
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
    </div>
  )

}
