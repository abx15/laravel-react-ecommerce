import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import CategoryCard from './CategoryCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CategorySlider = ({ categories, title, subtitle }) => {
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
                    spaceBetween={20}
                    slidesPerView={2}
                    breakpoints={{
                        640: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 25,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 30,
                        },
                        1280: {
                            slidesPerView: 6,
                            spaceBetween: 30,
                        },
                    }}
                    navigation={{
                        nextEl: '.category-swiper-button-next',
                        prevEl: '.category-swiper-button-prev',
                    }}
                    pagination={{
                        clickable: true,
                        el: '.category-swiper-pagination',
                        bulletActiveClass: 'swiper-pagination-bullet-active !bg-purple-600',
                    }}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={categories.length > 6}
                    className="!pb-16"
                >
                    {categories
                        .filter(cat => !cat.parent_id) // Only show parent categories
                        .slice(0, 12)
                        .map((category) => (
                            <SwiperSlide key={category.id} className="!h-auto">
                                <CategoryCard category={category} />
                            </SwiperSlide>
                        ))}
                </Swiper>

                {/* Custom Navigation Buttons - refined position and style */}
                <button className="category-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="category-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>

                {/* Custom Pagination */}
                <div className="category-swiper-pagination !bottom-0 !mt-8"></div>
            </div>
        </div>
    );
};

export default CategorySlider;
