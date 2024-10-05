/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
// import MainNavigator from './navigation/MainNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => MainNavigator);
