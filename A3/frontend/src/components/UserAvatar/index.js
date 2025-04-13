import { Avatar } from "@mui/material";

////////////// CODE ADAPTED FROM MUI AVATAR DOCUMENTATION //////////////
// https://mui.com/material-ui/react-avatar/
function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name) {
    const nameTrimmed = (name || '').trim();
    const userName = nameTrimmed.split(' ');

    let initials = '';
    if (userName.length > 1) {
        initials = `${userName[0][0]}${userName[1][0]}`;
    } else if (userName.length === 1 && userName[0].length > 0) {
        initials = `${userName[0][0]}`;
    } else {
        initials = 'U';
    }

    return {
        sx: {
            bgcolor: stringToColor(nameTrimmed),
        },
        children: `${initials.toUpperCase()}`,
    };
}

/////////////////////////////////////////////////////////////////////////

const UserAvatar = ({ name, avatarUrl, size}) => {
    const stringAvatarProps = !avatarUrl ? stringAvatar(name) : {};

    return (
        <Avatar
            alt={name || 'User'}
            src={avatarUrl || undefined}
            sx={{ width: size, height: size, fontSize: size * 0.5, ...stringAvatarProps.sx }}
            // {...(!avatarUrl && stringAvatar(name))}
        >
            {avatarUrl ? null : stringAvatarProps.children}
        </Avatar>
    );
};

export default UserAvatar;