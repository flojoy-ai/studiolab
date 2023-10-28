import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Status } from '@renderer/types/status'
import { useState } from 'react'

function App(): JSX.Element {
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: async (): Promise<Status> => {
      const { data } = await axios.get('http://localhost:2333/status')
      const parsedData = Status.safeParse(data)

      if (!parsedData.success) {
        throw new Error('captain returned an unknown status')
      }
      return parsedData.data
    }
  })

  const [envs, setEnvs] = useState<string[]>([])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isSuccess) {
    return <div>Something went wrong</div>
  }

  return (
    <div className="">
      <div>
        {data.status}: {data.message}
      </div>
      <button
        onClick={async (): Promise<void> => {
          const data = await window.api.getCondaEnvList()
          const parsed = JSON.parse(data)
          setEnvs(parsed['envs'])
        }}
      >
        CHECK
      </button>
      <div>
        {envs.map((env) => (
          <div key={env}>{env}</div>
        ))}
      </div>
    </div>
  )
}

export default App
