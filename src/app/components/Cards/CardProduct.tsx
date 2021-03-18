import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography,
    makeStyles
} from '@material-ui/core';

const user = {
    avatar: 'https://img.icons8.com/bubbles/2x/login-rounded-right.png',
    city: 'Los Angeles',
    country: 'USA',
    jobTitle: 'Senior Developer',
    name: 'Katarina Smith',
    timezone: 'GTM-7'
};

const useStyles = makeStyles(() => ({
    root: {},
    avatar: {
        height: 100,
        width: 100
    }
}));

const Profile = () => {
    const classes = useStyles();

    return (
        <Card
            className={classes.root}
        >
            <CardContent>
                <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                >
                    <Avatar
                        className={classes.avatar}
                        src={user.avatar}
                    />
                    <Typography
                        color="textPrimary"
                        gutterBottom
                        variant="h3"
                    >
                        Hello 0
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="body1"
                    >
                        Hello 1
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="body1"
                    >
                        Hello 2
                    </Typography>
                </Box>
            </CardContent>
            <Divider />
            <CardActions>
                <Button
                    color="primary"
                    fullWidth
                    variant="text"
                >
                    Upload picture
        </Button>
            </CardActions>
        </Card>
    );
};

export default Profile;
