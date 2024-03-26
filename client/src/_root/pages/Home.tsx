import { Shell } from '@/components/shell'

const chatUser = () => {
  return (
    <button
      className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
    >
      <div
        className="flex items-center justify-center h-8 w-8 bg-purple-200 rounded-full"
      >
        J
      </div>
      <div className="ml-2 text-sm font-semibold">Jerry Guzman</div>
    </button>
  )
}

const userProfile = () => {
  return (
    <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
      <div className="h-20 w-20 rounded-full border overflow-hidden">
        <img
          src="https://avatars3.githubusercontent.com/u/2763884?s=128"
          alt="Avatar"
          className="h-full w-full"
        />
      </div>
      <div className="text-sm font-semibold mt-2">Aminos Co.</div>
      <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
      <div className="flex flex-row items-center mt-3">
        <div
          className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full"
        >
          <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
        </div>
        <div className="leading-none ml-1 text-xs">Active</div>
      </div>
    </div>
  )
}

const banner = () => {
  return (
    <div className="flex flex-row items-center justify-center h-12 w-full">
      <div
        className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          ></path>
        </svg>
      </div>
      <div className="ml-2 font-bold text-2xl">QuickChat</div>
    </div>
  )
}

const sidebar = () => {
  return (
    <div className="h-[calc(100vh-15rem)] rounded-lg bg-accent">
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <div className="flex flex-col py-8 px-6 w-full flex-shrink-0">
            {banner()}
            {userProfile()}
            <div className="flex flex-col mt-8">
              <div className="flex flex-row items-center justify-between text-xs">
                <span className="font-bold">Active Conversations</span>
                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">4</span>
              </div>
              <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                {chatUser()}
                {chatUser()}
                {chatUser()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const home = () => {
  return (
    <Shell variant={'markdown'} className='h-[calc(100vh-10rem)]'>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 h-full">
        {sidebar()}
        <div className="h-full rounded-lg bg-accent lg:col-span-2">
        </div>
      </div>
    </Shell>
  )
}

export default home