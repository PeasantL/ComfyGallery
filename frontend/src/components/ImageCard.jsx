import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import '../styles/ImageCard.css'

const ImageCard = ({ image, onClick }) => (
  <Card className="image-card" onClick={onClick}>
    <div className="image-card-overlay-container">
      <CardMedia
        component="img"
        className="image-card-media"
        image={image.thumbnail}
        alt="Thumbnail"
        style={{
          objectFit: 'contain', //Can't increase spec. generated css
        }}
      />
      <div className="image-card-overlay">
        <Typography variant="subtitle2" className="image-card-text">
          {image.title}
        </Typography>
      </div>
    </div>
  </Card>
)

ImageCard.propTypes = {
  image: PropTypes.shape({
    thumbnail: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
}

export default ImageCard
