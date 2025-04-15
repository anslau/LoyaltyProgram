
import { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField, MenuItem, Stack, Chip,
    IconButton, CircularProgress, Pagination, FormGroup, FormControlLabel,
    Checkbox, TableSortLabel
} from "@mui/material";
import { FilterList as FilterListIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link } from "react-router-dom";
import UserAvatar from "../UserAvatar";

// Dropdown constants
const userRoles = [
    { value: 'regular', label: 'Regular' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
    { value: 'superuser', label: 'Superuser' },
];

const chipColour = (type) => {
    switch (type) {
        case 'regular': return 'success';
        case 'cashier': return 'error';
        case 'manager': return 'warning';
        case 'superuser': return 'info';
    }
};

const UserListTable = ({
    fetchFunction,
    onRowClick = null,
    title = "",
    columns = [], // additional columns for the manager transaction list
    additionalFilters = null,
}) => {
    const [filters, setFilters] = useState({
        name: '',
        role: '',
        verified: '',
        activated: '',
        page: 1,
        limit: 10
    });

    const [users, setUsers] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [clearFilter, setClearFilter] = useState(false);

    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');

    // Fetch users from the API
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { results, count } = await fetchFunction({...filters, orderBy, order});
            setUsers(results);
            setCount(Math.ceil(count / limit) || 1);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users when the component mounts or when filters change
    useEffect(() => {
        fetchUsers();
        setPage(1);
    }, [page, limit, orderBy, order]);

    const handleSearch = () => {
        setPage(1);
        setTimeout(() => {
            fetchUsers();
        }, 500);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        setFilters({ ...filters, page: value });
    };

    const handleLimitChange = (event) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(1);
        setFilters({ ...filters, page: 1, limit: parseInt(event.target.value, 10) });

    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const clearFilters = () => {
        setPage(1);
        setFilters({
            name: '',
            role: '',
            verified: '',
            activated: ''
        });
        setClearFilter(true);
    };

    // automatically fetch users when filters are cleared
    useEffect(() => {
        fetchUsers();
    }, [clearFilter]);

    const defaultColumns = [
        { key: 'id', label: 'User ID' },
        { key: 'utorid', label: 'Utorid' },
        {
            key: 'avatarUrl', label: 'Avatar', render: (value, user) => {
                return (
                    <UserAvatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        size={32}
                    />
                );
            }
        },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'birthday', label: 'Birthday', render: (value) => value ? value.slice(0, 10) : 'N/A' },
        {
            key: 'role',
            label: 'Role',
            render: (value) => (
                <Chip
                    label={value}
                    color={chipColour(value)}
                    size="small"
                    sx={{ marginLeft: '10px' }}
                />
            )
        },
        { key: 'points', label: 'Points' },
        { key: 'createdAt', label: 'Created At', render: (value) => value ? value.slice(0, 10) : 'N/A' },
        { key: 'lastLogin', label: 'Last Login', render: (value) => value ? value.slice(0, 10) : 'Never' },
        { key: 'verified', label: 'Verified', render: (value) => value === true ? 'Yes' : 'No' }
    ];

    const mergedColumns = [...defaultColumns, ...columns];

    ////////// FROM MUI TABLE DOCUMENTATION /////////////////////////
    // https://mui.com/material-ui/react-table/#sorting-amp-selecting
    // sorts the table based on the column clicked by asc/desc
    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const handleRequestSort = (columnKey) => {
        const isAsc = orderBy === columnKey && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(columnKey);
        setFilters({ ...filters, page: 1 });
    };

    const sortedUsers = orderBy
        ? [...users].sort(getComparator(order, orderBy))
        : users;
    /////////////////////////////////////////////////////////////////

    return (
        <div className="users-container">
            <Box sx={{ padding: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: 'rgb(101, 82, 82)' }}>
                        <IconButton>
                            <ArrowBackIcon sx={{ fontSize: '2rem' }} />
                        </IconButton>
                    </Link>
                    <Typography variant="h4">{title}</Typography>
                </Box>
            </Box>

            <Box sx={{ gap: 2 }}>
                <IconButton
                    color={showFilters ? 'rgb(101, 82, 82)' : 'default'}
                    onClick={toggleFilters}
                    aria-label="toggle filters"
                >
                    <Typography variant="body1" marginRight={5}>Filters</Typography>
                    <FilterListIcon />
                </IconButton>

                {showFilters && (
                    <Box
                        component="form"
                        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' }, mt: 2 }}
                    >
                        <TextField
                            label="Name" value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            helperText="Enter name or utorid"
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused': {
                                    '& fieldset': {
                                        borderColor: 'rgb(101, 82, 82)',
                                    },
                                },
                                '& label.Mui-focused': {
                                    color: 'rgb(101, 82, 82)',
                                }
                            }}
                        >
                        </TextField>

                        <TextField
                            select label="Role" value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            helperText="Select user role"
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused': {
                                    '& fieldset': {
                                        borderColor: 'rgb(101, 82, 82)',
                                    },
                                },
                                '& label.Mui-focused': {
                                    color: 'rgb(101, 82, 82)',
                                }
                            }}
                        >
                            {userRoles.map((option) => (
                                <MenuItem key={option.value} value={option.value}
                                sx={{
                                    '&.Mui-selected': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                                    '&.Mui-selected:hover': { bgcolor: 'rgba(232, 180, 180, 0.19)' },
                                  }}
                                >{option.label}</MenuItem>
                            ))}
                        </TextField>

                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={filters.verified}
                                    onChange={(e) => {
                                        setFilters({ ...filters, verified: e.target.checked });
                                    }}
                                    sx={{
                                        '&.Mui-checked': {
                                          color: '#c48f8f',
                                        },
                                      }}
                                />
                            }
                                label="Verified Users Only"
                            />
                        </FormGroup>

                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={filters.activated}
                                    onChange={(e) => {
                                        setFilters({ ...filters, activated: e.target.checked });
                                    }}
                                    sx={{
                                        '&.Mui-checked': {
                                          color: '#c48f8f',
                                        },
                                      }}
                                />
                            }
                                label="Activated Users Only"
                            />
                        </FormGroup>

                        {additionalFilters && additionalFilters(filters, setFilters)}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Chip
                                label="Clear Filters"
                                variant="outlined"
                                onClick={clearFilters}
                                sx={{ cursor: 'pointer' }}
                            />
                        </Box>

                        <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: '#ebc2c2', color: 'rgb(101, 82, 82)' }}>
                            Search
                        </Button>
                    </Box>
                )}
            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 2, overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {/* {mergedColumns.map(col => (
                                <TableCell key={col.key}>{col.label}</TableCell>
                            ))} */}
                            {mergedColumns.map((col) => (
                                <TableCell key={col.key} sortDirection={orderBy === col.key ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === col.key}
                                        direction={orderBy === col.key ? order : 'asc'}
                                        onClick={() => handleRequestSort(col.key)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={mergedColumns.length} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : error ? (
                            <TableRow><TableCell colSpan={mergedColumns.length} align="center">Error: {error.message}</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={mergedColumns.length} align="center">No users found</TableCell></TableRow>
                        ) : (
                            sortedUsers.map((t) => (
                                <TableRow key={t.id} hover onClick={() => onRowClick?.(t)}>
                                    {mergedColumns.map(col => (
                                        <TableCell key={col.key}>
                                            {col.render ? col.render(t[col.key], t) : t[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={count}
                    page={page}
                    onChange={handlePageChange}
                    color="#c48f8f"
                    showFirstButton
                    showLastButton
                />

                <TextField
                    type="number"
                    label="Rows per page"
                    variant="outlined"
                    value={limit}
                    onChange={handleLimitChange}
                    sx={{ marginLeft: 2,
                        '& .MuiOutlinedInput-root.Mui-focused': {
                            '& fieldset': {
                                borderColor: 'rgb(101, 82, 82)',
                            },
                        },
                        '& label.Mui-focused': {
                            color: 'rgb(101, 82, 82)',
                        }
                    }}
                />
            </Box>
        </div>
    );
};

export default UserListTable;
