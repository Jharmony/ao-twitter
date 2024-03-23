import React from 'react';
import { BsBookmark, BsChat, BsCoin, BsHeart } from 'react-icons/bs';
import { convertUrls, getWalletAddress, numberWithCommas, uuid } from '../util/util';
import { formatTimestamp } from '../util/util';
import './ActivityPost.css';
import parse, { attributesToProps } from 'html-react-parser';
import { Navigate } from 'react-router-dom';
import ViewImageModal from '../modals/ViewImageModal';
import AlertModal from '../modals/AlertModal';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { Service } from '../../server/service';

interface ActivityPostProps {
  data: any;
  afterRepost?: Function;
  beforeJump?: Function;
  isReply?: boolean;
  isPostPage?: boolean;
  txid?: string;
}

interface ActivityPostState {
  openImage: boolean;
  navigate: string;
  content: string;
  author: any;
  alert: string;
  avatar: string;
  address: string;
}

class ActivityPost extends React.Component<ActivityPostProps, ActivityPostState> {

  id: string;
  imgUrl: string;
  loading: boolean = false;

  static service: Service = new Service();

  parseOptions = {
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.name === 'img') {
        const props = attributesToProps(domNode.attribs);
        return <img className='ql-editor-image' onClick={(e) => this.tapImage(e, props.src)} {...props} />;
      }
    }
  };

  constructor(props: ActivityPostProps) {
    super(props);
    // let data  = this.props.data;
    // this.id  = data.id;

    this.state = {
      openImage: false,
      navigate: '',
      content: '',
      author: '',
      alert: '',
      avatar: '',
      address: '',
    };

    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    // this.getProfile();
    this.getPostContent();
    this.start();

    const links = document.querySelectorAll("[id^='url']");
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  componentWillUnmount() {
    const links = document.querySelectorAll("[id^='url']");
    for (let i = 0; i < links.length; i++) {
      links[i].removeEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  async start() {
    let address = await getWalletAddress();
    this.setState({ address });

    let avatar = '';
    if (this.props.data.address == address) {
      avatar = localStorage.getItem('avatar');
      if (!avatar) avatar = '';
    }

    this.createAvatar(avatar);
  }

  createAvatar(random: string) {
    const resp = createAvatar(micah, {
      seed: this.props.data.nickname + random,
      // ... other options
    });

    const avatar = resp.toDataUriSync();
    this.setState({ avatar });
  }

  newAvatar(e: any) {
    if (this.props.data.address !== this.state.address) return;
    e.stopPropagation();

    let random = uuid();
    localStorage.setItem('avatar', random);
    this.createAvatar(random);
  }

  async getPostContent() {
    let content = this.props.data.post;
    // content = convertHashTag(content);
    content = convertUrls(content);
    this.setState({ content });
  }

  async getProfile() {
    // let author = Server.public.getProfile(this.props.data.author);
    // if (!author) {
    //   await Server.public.cacheProfiles([this.props.data]);
    //   author = Server.public.getProfile(this.props.data.author);
    // }

    // this.setState({ author });
  }

  tapImage(e: any, src: string) {
    e.stopPropagation();
    this.imgUrl = src;
    this.setState({ openImage: true })
  }

  async onLike(e: any) {
    e.stopPropagation();
    this.setState({ alert: 'Like a Post with CRED ^_^' })
  }

  async onCoin(e: any) {
    e.stopPropagation();
    this.setState({ alert: 'See the earned CRED ^_^' })
  }

  async onBookmark(e: any) {
    e.stopPropagation();
    // this.setState({ alert: 'See the earned CRED ^_^' })
  }

  goProfilePage(e: any, id: string) {
    e.stopPropagation();
    if (window.location.pathname.indexOf('/profile/') == 0)
      return;

    this.setState({ navigate: '/profile/' + id });
  }

  goPostPage(id: string) {
    if (window.location.pathname.indexOf('/activity/post/') == 0)
      return;

    this.setState({ navigate: "/activity/post/" + id });

    // if (this.props.beforeJump)
    //   this.props.beforeJump();
  }

  onClose() {
    this.setState({ openImage: false });
  }

  renderActionsRow(data: any) {
    return (
      <div className='activity-post-action-row'>
        {!this.props.isReply &&
          <div className='activity-post-action'>
            <div className='activity-post-action-icon'>
              <BsChat />
            </div>
            <div className='activity-post-action-number'>
              {numberWithCommas(Number(data.replies))}
            </div>
          </div>
        }

        <div className='activity-post-action' onClick={(e) => this.onLike(e)}>
          <div className='activity-post-action-icon'>
            <BsHeart />
          </div>
          <div className='activity-post-action-number'>
            {numberWithCommas(Number(data.likes))}
          </div>
        </div>

        <div className='activity-post-action' onClick={(e) => this.onCoin(e)}>
          <div className='activity-post-action-icon'>
            <BsCoin />
          </div>
          <div className='activity-post-action-number'>
            {numberWithCommas(Number(data.coins))}
          </div>
        </div>

        <div className='activity-post-action' onClick={(e) => this.onBookmark(e)}>
          <div className='activity-post-action-icon'>
            <BsBookmark />
          </div>
        </div>
      </div>
    )
  }

  openLink(txid: string) {
    window.open('https://www.ao.link/message/' + txid);
  }

  render() {
    let owner = (this.props.data.address == this.state.address);

    let data = this.props.data;
    let address = data.address;
    if (address)
      address = address.substring(0, 4) + '...' + address.substring(address.length - 4);

    if (this.state.navigate)
      return <Navigate to={this.state.navigate} />;

    return (
      <div
        className={`home-msg-line ${this.props.isReply || this.props.isPostPage ? 'no_hover' : ''}`}
        style={{ cursor: this.state.openImage || this.props.isReply || this.props.isPostPage ? 'auto' : 'pointer' }}
        onClick={() => this.goPostPage(data.id)}
      >
        <div className='home-msg-header'>
          <img
            className='home-msg-portrait'
            src={this.state.avatar}
            alt='avatar'
            onClick={(e) => this.newAvatar(e)}
            title={owner ? 'Click to change your avatar' : ''}
          />
          <div className="home-msg-nickname">{data.nickname}</div>
          <div className="home-msg-address">{address}</div>
          <div className='home-msg-time'>&#x2022;&nbsp;&nbsp;{formatTimestamp(data.time, true)}</div>
          {this.props.isPostPage && this.props.txid &&
            <img
              className='activity-post-arweave-icon'
              src='/ar.svg'
              onClick={() => this.openLink(this.props.txid)}
              title='Go to ao.link'
            />
          }
        </div>

        <div className='home-message'>
          {parse(this.state.content, this.parseOptions)}
        </div>

        {this.renderActionsRow(data)}

        <AlertModal message={this.state.alert} button="OK" onClose={() => this.setState({ alert: '' })} />
        <ViewImageModal open={this.state.openImage} src={this.imgUrl} onClose={this.onClose} />
      </div>
    )
  }
}

export default ActivityPost;