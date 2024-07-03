export const generateRandomString = length => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&()_+|}{[]:?></-=';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const formatDate = (date) => {

  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Месяцы начинаются с 0
  const year = date.getFullYear().toString().slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};
