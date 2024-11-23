import { Grid2 } from '@mui/material';
import PropTypes from 'prop-types';
import '../styles/ImageCatalog.css';
import ImageCard from './ImageCard';

const ImageCatalog = ({ images, handleCardClick }) => (
  <Grid2 container spacing={2} className="image-catalog">
    {images.map((image) => (
      <Grid2 xs={12} sm={6} md={4} lg={3} key={image.id} display="flex" justifyContent="center">
        <ImageCard image={image} onClick={handleCardClick} />
      </Grid2>
    ))}
  </Grid2>
);

ImageCatalog.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleCardClick: PropTypes.func.isRequired,
};

export default ImageCatalog;
