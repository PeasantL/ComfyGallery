import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import '../styles/ImageModal.css'

const ImageModal = ({ isOpen, image = null, onClose }) => (
  <Modal open={isOpen} onClose={onClose} className="image-modal">
    <Box className="image-modal-content" onClick={onClose}>
      {image && (
        <>
          <img
            src={image.original}
            alt={image.title}
            className="image-modal-img"
          />
        </>
      )}
    </Box>
  </Modal>
)

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  image: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    src: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
}

export default ImageModal
