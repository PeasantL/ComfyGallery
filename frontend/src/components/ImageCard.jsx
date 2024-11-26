import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import '../styles/ImageCard.css'

const ImageCard = ({ image, onClick }) => (
  <Card className="image-card" onClick={onClick}>
    <CardMedia
      component="img"
      className="image-card-media"
      image={image.thumbnail} // Thumbnail URL passed directly
      alt="Thumbnail"
    />
    <CardContent className="image-card-content">
      <Typography variant="subtitle2" gutterBottom>
        {image.title} {/* Use title directly if available */}
      </Typography>
    </CardContent>
  </Card>
)

ImageCard.propTypes = {
  image: PropTypes.object.isRequired, // Expect the `thumbnail` URL
  onClick: PropTypes.func.isRequired,
}

export default ImageCard
