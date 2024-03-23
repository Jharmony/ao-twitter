export class AppConfig {
  public static siteName = 'Up Up';
  public static secretPassword = 'ploy';

  public static menu = [
    {
      text: 'Home',
      icon: 'home',
      to: '/',
      loggedIn: false
    },
    {
      text: 'Story',
      icon: 'story',
      to: '/story',
      beta: true,
      loggedIn: false
    },
    {
      text: 'TokenEco',
      icon: 'token',
      to: '/token',
      loggedIn: false
    },
    {
      text: 'Games',
      icon: 'games',
      to: '/games',
      loggedIn: false
    },
    {
      text: 'Chatroom',
      icon: 'chatroom',
      to: '/chat',
      loggedIn: false
    },
    {
      text: 'Notifications',
      icon: 'notifications',
      to: '/notifications',
      loggedIn: false
    },
    {
      text: 'Bookmark',
      icon: 'bookmark',
      to: '/bookmark',
      new: false,
      loggedIn: false
    },
    {
      text: 'Profile',
      icon: 'profile',
      to: '/profile',
      loggedIn: false
    },
  ];
}