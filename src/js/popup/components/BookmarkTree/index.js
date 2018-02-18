// @flow
// @jsx createElement

import * as R from 'ramda'
import {PureComponent, createElement} from 'react'
import {connect} from 'react-redux'

import {bookmarkCreators} from '../../reduxs'
import BookmarkTree from './BookmarkTree'

type Props = {
  focusId: string,
  removeFocusId: () => void,
  setFocusId: (string) => void,
  treeInfo: Object
};
class BookmarkTreeContainer extends PureComponent<Props> {
  handleMouseEnter = (bookmarkId: string) => () => {
    this.props.setFocusId(bookmarkId)
  }

  handleMouseLeave = () => {
    this.props.removeFocusId()
  }

  render = () => (
    <BookmarkTree
      {...this.props}
      onMouseEnter={this.handleMouseEnter}
      onMouseLeave={this.handleMouseLeave}
    />
  )
}

const mapStateToProps = (state, ownProps) => ({
  focusId: R.path(['bookmark', 'focusId'], state),
  treeInfo: state.bookmark.trees.find(R.pathEq(['parent', 'id'], ownProps.treeId))
})

const mapDispatchToProps = R.pick(
  ['openBookmarkTree', 'removeFocusId', 'setFocusId'],
  bookmarkCreators
)

export default connect(mapStateToProps, mapDispatchToProps)(BookmarkTreeContainer)
