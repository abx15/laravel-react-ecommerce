import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Hero = () => {
    const slides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
            title: "Summer Collection 2026",
            subtitle: "Discover the hottest trends for the season.",
            cta: "Shop Now",
            color: "from-orange-500 to-red-600"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop",
            title: "Smart Home Revolution",
            subtitle: "Upgrade your living space with latest tech.",
            cta: "Explore Tech",
            color: "from-blue-500 to-cyan-600"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
            title: "Premium Footwear",
            subtitle: "Step up your game with our exclusive range.",
            cta: "View Collection",
            color: "from-purple-500 to-indigo-600"
        }
    ];

    return (
        <div className="w-full h-[60vh] md:h-[70vh] lg:h-[80vh] bg-gray-900 relative group">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="w-full h-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative w-full h-full">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover object-center"
                            />
                            {/* Gradient Overlay for Depth */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-30 mix-blend-multiply`} />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="container-custom">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    viewport={{ once: false }}
                                    className="max-w-2xl text-white p-6 md:p-12"
                                >
                                    <h2 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                                        {slide.title}
                                    </h2>
                                    <p className="text-lg md:text-2xl mb-8 text-gray-200 drop-shadow-md font-light">
                                        {slide.subtitle}
                                    </p>
                                    <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2">
                                        {slide.cta} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <div className="swiper-button-next-custom absolute top-1/2 right-4 md:right-8 z-10 -translate-y-1/2 cursor-pointer w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 opacity-0 group-hover:opacity-100">
                <ArrowRight className="w-6 h-6" />
            </div>
            <div className="swiper-button-prev-custom absolute top-1/2 left-4 md:left-8 z-10 -translate-y-1/2 cursor-pointer w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 rotate-180 opacity-0 group-hover:opacity-100">
                <ArrowRight className="w-6 h-6" />
            </div>

            {/* Bottom Fade to blend with content */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-100 to-transparent z-10" />
        </div>
    );
};

export default Hero;
