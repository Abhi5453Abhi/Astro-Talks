import Image from 'next/image'
import { motion } from 'framer-motion'

interface Astrologer {
    id: string
    name: string
    specialties: string[]
    experience: number
    price: number
    image_url: string
    is_celebrity: boolean
    is_online: boolean
    rating: number
    reviews: number
    languages?: string[]
    wait_time?: string
}

interface AstrologerCardProps {
    astrologer: Astrologer
    onChat: (astrologer: Astrologer) => void
    fullWidth?: boolean
    mode?: 'chat' | 'call'
}

export default function AstrologerCard({ astrologer, onChat, fullWidth = false, mode = 'chat' }: AstrologerCardProps) {
    if (fullWidth) {
        // Full-width card for list view (like the screenshot)
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-slate-700/50 flex gap-4"
            >
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full border-4 border-yellow-400 p-0.5 bg-white">
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                            <Image
                                src={astrologer.image_url}
                                alt={astrologer.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    </div>
                    {/* Online Status */}
                    {astrologer.is_online && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-0.5">{astrologer.reviews} orders</p>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">
                            {astrologer.name}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1">
                            {astrologer.specialties.join(', ')}
                        </p>
                        {astrologer.languages && (
                            <p className="text-gray-400 text-sm mb-1">
                                {astrologer.languages.join(', ')}
                            </p>
                        )}
                        <p className="text-gray-400 text-sm">
                            Exp- {astrologer.experience} Years
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-gray-500 line-through text-sm">₹ {Math.floor(astrologer.price * 1.5)}</span>
                            <span className="text-yellow-400 font-bold text-lg">{astrologer.price}/min</span>
                        </div>
                    </div>
                </div>

                {/* Action Button (Chat or Call) */}
                <div className="flex flex-col justify-end items-end">
                    <button
                        onClick={() => onChat(astrologer)}
                        className={`px-8 py-2.5 rounded-full font-bold text-base transition-colors ${
                            astrologer.is_online && !astrologer.wait_time
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {mode === 'call' ? 'Call' : 'Chat'}
                    </button>
                    {astrologer.wait_time && (
                        <p className="text-red-400 text-xs mt-1">wait ~ {astrologer.wait_time}</p>
                    )}
                </div>
            </motion.div>
        )
    }

    // Original compact card for grid view
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="min-w-[160px] w-[160px] bg-white rounded-2xl p-3 flex flex-col items-center shadow-lg relative border border-gray-100"
        >
            {/* Celebrity Badge */}
            {astrologer.is_celebrity && (
                <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-slate-800 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-lg shadow-md transform -rotate-12">
                        ★ Celebrity
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div className="relative w-24 h-24 mb-3">
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400 p-1">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
                        <Image
                            src={astrologer.image_url}
                            alt={astrologer.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
                {/* Online Status */}
                {astrologer.is_online && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>

            {/* Details */}
            <h3 className="text-slate-900 font-bold text-base text-center leading-tight mb-1">
                {astrologer.name}
            </h3>

            <p className="text-gray-500 text-xs font-medium mb-3">
                ₹ {astrologer.price}/min
            </p>

            {/* Action Button */}
            <button
                onClick={() => onChat(astrologer)}
                className="w-full py-2 px-4 rounded-full border border-green-500 text-green-600 font-bold text-sm hover:bg-green-50 transition-colors"
            >
                {mode === 'call' ? 'Call' : 'Chat'}
            </button>
        </motion.div>
    )
}
