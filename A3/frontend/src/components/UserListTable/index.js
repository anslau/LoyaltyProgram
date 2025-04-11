
import { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, TextField, MenuItem, Stack, Chip,
    IconButton, CircularProgress, Pagination, FormGroup, FormControlLabel,
    Checkbox
} from "@mui/material";
import { FilterList as FilterListIcon } from '@mui/icons-material';
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

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { results, count } = await fetchFunction(filters);
            setUsers(results);
            setCount(Math.ceil(count / limit) || 1);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        setPage(1);
    }, [page, limit]);

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
        { key: 'birthday', label: 'Birthday', render: (value) => value || 'N/A' },
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

    return (
        <div className="users-container">
            <Box sx={{ padding: 2 }}>
                <Typography variant="h4" gutterBottom>{title}</Typography>
            </Box>

            <Box sx={{ gap: 2 }}>
                <IconButton
                    color={showFilters ? 'primary' : 'default'}
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
                        >
                        </TextField>

                        <TextField
                            select label="Role" value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            helperText="Select user role"
                        >
                            {userRoles.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </TextField>

                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={filters.verified}
                                    onChange={(e) => {
                                        setFilters({ ...filters, verified: e.target.checked });
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

                        <Button variant="contained" onClick={handleSearch}>
                            Search
                        </Button>
                    </Box>
                )}
            </Box>

            <TableContainer component={Paper} sx={{ marginTop: 2, overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {mergedColumns.map(col => (
                                <TableCell key={col.key}>{col.label}</TableCell>
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
                            users.map((t) => (
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
                    color="primary"
                    showFirstButton
                    showLastButton
                />

                <TextField
                    type="number"
                    label="Rows per page"
                    variant="outlined"
                    value={limit}
                    onChange={handleLimitChange}
                    sx={{ marginLeft: 2 }}
                />
            </Box>
        </div>
    );
};

export default UserListTable;
