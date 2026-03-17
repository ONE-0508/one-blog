import { getAccessToken } from './token';

export default function checkLogin() {
  return !!getAccessToken();
}
