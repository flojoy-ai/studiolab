import {useCallback, useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";

export const Index = (): JSX.Element => {
  const socketURL = 'http://localhost:2333/blocks/ws'
  const [messageHistory, setMessageHistory] = useState<any>([])
  const {sendMessage, lastMessage, readyState} = useWebSocket(socketURL)




  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);


  const handleClickSendMessage = useCallback(() => sendMessage('1'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 1
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );

}
