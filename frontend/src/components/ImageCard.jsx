import { Card, CardMedia, CardContent, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import '../styles/ImageCard.css'

const ImageCard = ({ image, onClick }) => (
  <Card className="image-card" onClick={() => onClick(image)}>
    <CardMedia
      component="img"
      className="image-card-media"
      image={image.src}
      alt={image.title}
    />
    <CardContent className="image-card-content">
      <Typography variant="subtitle2" gutterBottom>
        {image.title}
      </Typography>
    </CardContent>
  </Card>
)

ImageCard.propTypes = {
  image: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
}

export default ImageCard
