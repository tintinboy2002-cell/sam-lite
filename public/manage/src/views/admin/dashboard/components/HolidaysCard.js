import React, { useEffect, useState, useCallback } from 'react';
import Slider from 'react-slick';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import PropTypes from 'prop-types';
import httpInjectorService from 'services/http-injector.service';
import noholidays from '../../../../assets/img/dashboards/Questions-bro.png';

// ---------- Arrow Button ----------
const ArrowButton = ({ onClick, direction }) => {
  const isNext = direction === 'next';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        [isNext ? 'right' : 'left']: '-13px',
        zIndex: 5,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
      }}
    >
      {isNext ? (
        <FaChevronRight color="white" />
      ) : (
        <FaChevronLeft color="white" />
      )}
    </button>
  );
};

ArrowButton.propTypes = {
  onClick: PropTypes.func,
  direction: PropTypes.oneOf(['next', 'prev']).isRequired,
};

// ---------- Slider Wrapper ----------
const SliderWrapper = ({ festivals = [] }) => {
  if (!Array.isArray(festivals) || festivals.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: 200,
          borderRadius: 12,
          background: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        <img
          src={noholidays}
          alt="No holidays available"
          style={{ maxWidth: '50%', maxHeight: '50%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <ArrowButton direction="next" />,
    prevArrow: <ArrowButton direction="prev" />,
  };

  return (
    <Slider {...settings} className="h-100">
      {festivals.map((f, idx) => (
        <div key={idx}>
          <div
            className="position-relative shadow-sm"
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              height: 220, // slightly taller for better layout
            }}
          >
            {/* Blurred Background */}
            <div
              style={{
                backgroundImage: `url(${f.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(12px)',
                transform: 'scale(1.2)',
                position: 'absolute',
                inset: 0,
              }}
            />

            {/* Foreground Actual Image */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <img
                src={f.image_url}
                alt={f.holiday_description}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Gradient Overlay for Text */}
            <div
              className="position-absolute bottom-0 w-100 text-white p-3"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                fontSize: '0.9rem',
                zIndex: 2,
              }}
            >
              <div className="fw-bold">{f.holiday_description}</div>
              <div>{new Date(f.date).toDateString()}</div>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

SliderWrapper.propTypes = {
  festivals: PropTypes.arrayOf(
    PropTypes.shape({
      image_url: PropTypes.string.isRequired,
      holiday_description: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

// ---------- Holidays Card ----------
function HolidaysCard() {
  const [sliderImages, setSliderImages] = useState([]);

  const getUpcomingFestivals = useCallback(async () => {
    try {
      const response = await httpInjectorService.getUpcomingFestivals();
      if (response.status === 'success') {
        setSliderImages(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch festivals', err);
    }
  }, []);

  useEffect(() => {
    getUpcomingFestivals();
  }, [getUpcomingFestivals]);

  return (
    <div className="mt-3">
      <div className="shadow-md p-3 rounded bg-white">
        <div className="row">
          <span className="card-title fw-bold">Upcoming Holidays</span>
          <div
            className="position-relative w-100 text-white"
            style={{ borderRadius: 12, overflow: 'hidden', minHeight: 200 }}
          >
            <SliderWrapper festivals={sliderImages || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HolidaysCard;
