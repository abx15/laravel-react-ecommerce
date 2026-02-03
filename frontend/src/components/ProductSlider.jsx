import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductSlider = ({ products, title, subtitle }) => {
    return (
        <div className="w-full">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="relative">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 25,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 30,
                        },
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                        bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600',
                    }}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={products.length > 5}
                    className="!pb-16"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id} className="!h-auto">
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Buttons - refined position and style */}
                <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Custom Pagination */}
                <div className="swiper-pagination !bottom-0 !mt-8"></div>
            </div>
        </div>
    );
};

export default ProductSlider;
