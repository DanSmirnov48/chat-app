import { useBackgroundStore } from '@/hooks/useChat';
import { SquareCheckBig } from 'lucide-react';

export default function ChatWindowSettings() {

    const selectedBackground = useBackgroundStore((state) => state.selectedBackground);
    const setSelectedBackground = useBackgroundStore((state) => state.setSelectedBackground);

    const backgrounds = [
        { name: 'Subtle Prism', value: '/chat-backgrounds/subtle-prism.svg' },
        { name: 'Zig Zag', value: '/chat-backgrounds/diamond-sunset.svg' },
        { name: 'Hollowed Boxes', value: '/chat-backgrounds/sun-tornado.svg' },
        { name: 'Protruding Squares', value: '/chat-backgrounds/bermuda-square.svg' },
        { name: 'Hollowed Boxes', value: '/chat-backgrounds/pattern-randomized.svg' },
        { name: 'Hollowed Boxes', value: '/chat-backgrounds/repeating-triangles.svg' },
    ];

    const ImageBox = ({ label, value }: { label: string; value: string }) => (
        <div
            onClick={() => setSelectedBackground(value)}
            className="relative w-full h-40 p-1 rounded-lg overflow-hidden border-4 hover:border-foreground/50 transition duration-300 ease-in-out"
            style={{ backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
            {selectedBackground === value && <SquareCheckBig className='absolute top-3 right-3 fill-transparent text-green-600' strokeWidth='3' />}
        </div>
    );

    return (
        <div className="flex flex-col w-full mx-auto gap-5 my-5">
            <ul className="grid grid-cols-2 gap-5">
                {backgrounds.map(background => (
                    <li key={background.value}>
                        <ImageBox label={background.name} value={background.value} />
                    </li>
                ))}
            </ul>
        </div>
    );
}