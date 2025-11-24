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
}

interface AstrologerCardProps {
    astrologer: Astrologer
    onChat: (astrologer: Astrologer) => void
}

export default function AstrologerCard({ astrologer, onChat }: AstrologerCardProps) {
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

            {/* Chat Button */}
            <button
                onClick={() => onChat(astrologer)}
                className="w-full py-2 px-4 rounded-full border border-green-500 text-green-600 font-bold text-sm hover:bg-green-50 transition-colors"
            >
                Chat
            </button>
        </motion.div>
    )
}
