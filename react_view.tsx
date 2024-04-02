import { useContext, useState, useRef, useEffect } from 'react'
import { AppContext } from 'main_view'
import { App } from 'obsidian'
import { format } from 'date-fns'

const tempPath = 'p.zen.md'
async function startNewPage(app: App) {
	await app?.vault.adapter.write(
		tempPath,
		'### ' + format(new Date(), 'HH:mm') + '\n',
	)

	const file = app.vault.getFileByPath(tempPath)!!
	const leaf = app.workspace.getLeaf()
	await leaf.openFile(file)
}

async function mergePage(app: App) {
	const data = await app.vault.adapter.read(tempPath)!!
	app.vault.adapter.remove(tempPath)

	const journalPath = `journals/${format(new Date(), 'yyyy-MM-dd')}.md`
	const jFile = app.vault.getFileByPath(journalPath)!!
	await app.vault.append(jFile, '\n\n' + data)
	const leaf = app.workspace.getLeaf()
	await leaf.openFile(jFile)
}

function useTomato(): [number, React.Dispatch<React.SetStateAction<number>>] {
	const app = useContext(AppContext)
	const [count, setCount] = useState(0)

	function template() {
		return `---\n🍅: "0"\n---\n`
	}

	useEffect(() => {
		const journalPath = `journals/${format(new Date(), 'yyyy-MM-dd')}.md`
		app?.vault.adapter
			.read(journalPath)
			.then((data) => {
				const countReg = data.match(/🍅: "(\d+)"/)
				if (countReg && Number(countReg[1]) !== count)
					setCount(Number(countReg[1]))
			})
			.catch((error) => {
				if (error.message.includes('no such file')) {
					app?.vault.create(journalPath, template())
				}
			})
	}, [])

	async function setTomato(value: number) {
		const journalPath = `journals/${format(new Date(), 'yyyy-MM-dd')}.md`
		const data = (await app?.vault.adapter.read(journalPath)) || template()

		// 替换 🍅 count
		const newData = data?.replace(/🍅: "(\d+)"/, `🍅: "${value}"`)
		await app?.vault.adapter.write(journalPath, newData)
		setCount(value)
	}

	return [count, setTomato]
}

function StartButton({ onClick }: { onClick: (eventName: string) => void }) {
	return (
		<button onClick={() => onClick('start')}>
			<svg
				className='svg-icon lucide lucide-play'
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
				strokeLinecap='round'
				strokeLinejoin='round'>
				<polygon points='6 3 20 12 6 21 6 3'></polygon>
			</svg>
		</button>
	)
}

function PauseButton({ onClick }: { onClick: (eventName: string) => void }) {
	return (
		<button onClick={() => onClick('pause')}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width={24}
				height={24}
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth={2}
				strokeLinecap='round'
				strokeLinejoin='round'
				className='lucide lucide-pause'>
				<rect x={14} y={4} width={4} height={16} rx={1} />
				<rect x={6} y={4} width={4} height={16} rx={1} />
			</svg>
		</button>
	)
}

function StopButton({ onClick }: { onClick: (eventName: string) => void }) {
	return (
		<button onClick={() => onClick('stop')}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width={24}
				height={24}
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth={2}
				strokeLinecap='round'
				strokeLinejoin='round'
				className='lucide lucide-circle-x'>
				<circle cx={12} cy={12} r={10} />
				<path d='M15 9l-6 6M9 9l6 6' />
			</svg>
		</button>
	)
}

function ResetButton({ onClick }: { onClick: (eventName: string) => void }) {
	return (
		<button onClick={() => onClick('reset')}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width={24}
				height={24}
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth={2}
				strokeLinecap='round'
				strokeLinejoin='round'
				className='lucide lucide-book-open-check'>
				<path d='M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4zM16 12l2 2 4-4' />
				<path d='M22 6V3h-6c-2.2 0-4 1.8-4 4v14c0-1.7 1.3-3 3-3h7v-2.3' />
			</svg>
		</button>
	)
}

function Buttons(props: {
	status: string
	onClick: (eventName: string) => void
}) {
	const { status, onClick } = props

	return (
		<div className='button-container'>
			{status === 'pending' ? (
				<StartButton onClick={onClick}></StartButton>
			) : null}
			{status === 'running' ? (
				<>
					<PauseButton onClick={onClick}></PauseButton>
					<StopButton onClick={onClick}></StopButton>
				</>
			) : null}
			{status === 'paused' ? (
				<>
					<StartButton onClick={onClick}></StartButton>
					<StopButton onClick={onClick}></StopButton>
				</>
			) : null}
			{status === 'stopped' ? (
				<ResetButton onClick={onClick}></ResetButton>
			) : null}
		</div>
	)
}

function Icon({ minutes, isRest }: { minutes: number; isRest: Boolean }) {
	if (isRest) return <div className='icon'>🍏</div>
	if (minutes < 0) return null

	if (minutes > 20) return <div className='icon'>🌱</div>
	if (minutes > 15) return <div className='icon'>🌿</div>
	if (minutes > 10) return <div className='icon'>🪴</div>
	return <div className='icon'>🍵</div>
}

function Timer({ time, isRest }: { time: number; isRest: Boolean }) {
	if (time < 0) return null
	const minutes = Math.floor(time / 1000 / 60)
		.toString()
		.padStart(2, '0')
	const seconds = Math.floor((time / 1000) % 60)
		.toString()
		.padStart(2, '0')

	return (
		<div className='timer'>
			<Icon minutes={Number(minutes)} isRest={isRest}></Icon>
			{minutes}:{seconds}
		</div>
	)
}

export const ReactView = () => {
	const app = useContext(AppContext)
	const [tomato, setTomato] = useTomato()
	const [status, setStatus] = useState<
		'pending' | 'running' | 'paused' | 'stopped' | string
	>('pending')
	const intervalRef = useRef<number | undefined>()
	const [startTime, setStartTime] = useState(0)
	const [now, setNow] = useState(0)
	const endAt =
		status === 'stopped'
			? startTime + 5 * 60 * 1000
			: startTime + 25 * 60 * 1000

	function clickHandle(eventName: string) {
		if (eventName === 'start') {
			if (status === 'paused') setStartTime(Date.now() - (endAt - now))
			else {
				setStartTime(Date.now())
				startNewPage(app!!)
			}

			setNow(Date.now())
			if (intervalRef.current) window.clearInterval(intervalRef.current)
			intervalRef.current = window.setInterval(tick, 1000)
			setStatus('running')
		}

		if (eventName === 'pause') {
			window.clearInterval(intervalRef.current)
			setStatus('paused')
		}

		if (eventName === 'stop') {
			setStatus('stopped')
			setStartTime(Date.now())
			mergePage(app!!)
		}

		if (eventName === 'reset') {
			setStatus('pending')
			setStartTime(Date.now())
		}
	}
	function tick() {
		if (status === 'running') {
			if (now >= endAt) {
				new window.Notification('Time is up!')
				setStatus('stopped')
				setStartTime(Date.now())
        setTomato(tomato + 1)
			}
		}
		if (status === 'stopped') {
			if (now >= endAt) {
				window.clearInterval(intervalRef.current)
				new window.Notification('Ready to start!')
				setStatus('pending')
			}
		}

		setNow(Date.now())
	}

	const time = endAt - now
	return (
		<div className='plugins-view persona'>
			<div className='main'>
				<div className='timer-holder'>
					{status === 'pending' ? null : (
						<Timer time={time} isRest={status === 'stopped'}></Timer>
					)}
				</div>
				<Buttons status={status} onClick={clickHandle}></Buttons>
			</div>
			<footer>
				<div className='count'>{'🍅'.repeat(tomato)}</div>
			</footer>
		</div>
	)
}
