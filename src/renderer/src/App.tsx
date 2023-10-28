import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Status } from './types/status'

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
    </div>
  )
}

export default App
