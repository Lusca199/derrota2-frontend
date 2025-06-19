// src/components/PublicationItem.jsx (versão final, completa e com menções)

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// MUI Imports
import { Box, Typography, Avatar, IconButton, TextField, Button, Link, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IosShareIcon from '@mui/icons-material/IosShare';
import { blue, red } from '@mui/material/colors';

// --- NOVA FUNÇÃO AUXILIAR PARA RENDERIZAR O TEXTO COM MENÇÕES ---
// Esta função recebe o texto e a lista de menções (com user_id e username) vinda da API.
const renderTextWithMentions = (text, mentions = []) => {
    if (!text) return null;

    // Se não houver menções na publicação, retorna o texto simples para melhor performance.
    if (!mentions || mentions.length === 0) {
        return <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', my: 1 }}>{text}</Typography>;
    }

    // Regex para encontrar as menções no texto.
    const mentionRegex = /@(\w+)/g;
    
    // Divide o texto em partes: texto normal e menções.
    // Ex: "Olá @viana como está?" -> ["Olá ", "viana", " como está?"]
    const parts = text.split(mentionRegex);

    return (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', my: 1 }}>
            {parts.map((part, index) => {
                // As partes com índice ímpar são os usernames capturados pela regex.
                if (index % 2 === 1) { 
                    const mention = mentions.find(m => m.username.toLowerCase() === part.toLowerCase());
                    if (mention) {
                        return (
                            <Link 
                                component={RouterLink} 
                                to={`/profile/${mention.user_id}`} 
                                key={index} 
                                onClick={(e) => e.stopPropagation()}
                                sx={{fontWeight: 'bold'}}
                            >
                                @{part}
                            </Link>
                        );
                    }
                }
                // Retorna o texto normal.
                return part;
            })}
        </Typography>
    );
};


function PublicationItem({ publication, onPostDeleted, onPostUpdated }) {
    const { user, signed } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(publication.texto);
    const isAuthor = user && user.id === publication.autor_id;

    // Estados para a funcionalidade de "Curtir"
    const [likeCount, setLikeCount] = useState(parseInt(publication.like_count, 10) || 0);
    const [isLiked, setIsLiked] = useState(publication.is_liked_by_me || false);

    // Estados para o menu de opções (Editar/Apagar)
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Constrói a URL completa para a imagem de perfil do autor
    const fullAuthorImageUrl = publication.autor_foto_perfil_url
        ? `http://localhost:3001${publication.autor_foto_perfil_url}`
        : null;

    // --- Funções de Manipulação de Eventos ---

    const handleNavigateToDetail = () => {
        if (!isEditing) {
            navigate(`/post/${publication.id_pub}`);
        }
    };

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        event.stopPropagation();
        setAnchorEl(null);
    };

    const handleLikeToggle = async (event) => {
        event.stopPropagation();
        if (!signed) {
            alert("Você precisa estar logado para curtir uma publicação.");
            return;
        }

        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

        try {
            if (isLiked) {
                await api.delete(`/reacoes/${publication.id_pub}/like`);
            } else {
                await api.post(`/reacoes/${publication.id_pub}/like`);
            }
        } catch (error) {
            console.error("Erro ao curtir/descurtir:", error);
            setIsLiked(isLiked);
            setLikeCount(likeCount);
            alert("Ocorreu um erro ao processar sua curtida.");
        }
    };
    
    const handleDelete = async (event) => {
        event.stopPropagation();
        handleMenuClose(event);
        if (window.confirm('Tem a certeza que deseja apagar esta publicação?')) {
            try {
                await api.delete(`/publicacoes/${publication.id_pub}`);
                onPostDeleted(publication.id_pub);
            } catch (error) {
                alert('Não foi possível apagar a publicação.');
            }
        }
    };
    
    const handleEdit = (event) => {
        event.stopPropagation();
        handleMenuClose(event);
        setIsEditing(true);
    };

    const handleUpdate = async (event) => {
        event.stopPropagation();
        if (editText.trim() === "" && !publication.media_url) return;
        try {
            const response = await api.put(`/publicacoes/${publication.id_pub}`, { texto: editText });
            onPostUpdated(response.data);
            setIsEditing(false);
        } catch (error) {
            alert('Não foi possível editar a publicação.');
        }
    };

    const handleCancelEdit = (event) => {
        event.stopPropagation();
        setIsEditing(false);
        setEditText(publication.texto);
    };

    return (
        <Box 
            onClick={handleNavigateToDetail}
            sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                display: 'flex', 
                gap: 2,
                cursor: isEditing ? 'default' : 'pointer',
                '&:hover': {
                    backgroundColor: isEditing ? 'transparent' : 'action.hover'
                }
            }}
        >
            <Avatar
                src={fullAuthorImageUrl}
                sx={{ bgcolor: blue[500], width: 48, height: 48, cursor: 'pointer' }}
                component={RouterLink}
                to={`/profile/${publication.autor_id}`}
                onClick={(e) => e.stopPropagation()}
            >
                {!fullAuthorImageUrl && (publication.nome_autor ? publication.nome_autor[0].toUpperCase() : '?')}
            </Avatar>

            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" component="span">
                            <Link 
                                component={RouterLink} 
                                to={`/profile/${publication.autor_id}`} 
                                underline="hover" 
                                color="inherit"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {publication.nome_autor}
                            </Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            · {new Date(publication.criado_em).toLocaleDateString('pt-BR')}
                        </Typography>
                    </Box>
                    {isAuthor && !isEditing && (
                        <IconButton size="small" onClick={handleMenuClick}>
                            <MoreHorizIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                {isEditing ? (
                   <Box>
                        <TextField
                            multiline
                            fullWidth
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            variant="outlined"
                            sx={{ my: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleCancelEdit} size="small">Cancelar</Button>
                            <Button onClick={handleUpdate} size="small" variant="contained">Salvar</Button>
                        </Box>
                    </Box>
                ) : (
                    <>
                        {/* Chamada à nova função que renderiza o texto com os links de menção */}
                        {renderTextWithMentions(publication.texto, publication.mencoes)}
                       
                        {publication.media_url && (
                            <Box sx={{ my: 1, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <img
                                    src={`http://localhost:3001${publication.media_url}`}
                                    alt="Mídia da publicação"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </Box>
                        )}
                    </>
                )}

                {!isEditing && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '425px', mt: 1, color: 'text.secondary' }}>
                        <IconButton size="small" onClick={(e) => {e.stopPropagation(); handleNavigateToDetail();}}><ChatBubbleOutlineIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={(e) => e.stopPropagation()}><RepeatIcon fontSize="small" /></IconButton>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <IconButton size="small" onClick={handleLikeToggle}>
                                {isLiked ? 
                                    <FavoriteIcon sx={{ color: red[500] }} fontSize="small" /> :
                                    <FavoriteBorderIcon fontSize="small" />
                                }
                            </IconButton>
                            <Typography variant="body2" sx={{color: isLiked ? red[500] : 'inherit', minWidth: '20px'}}>
                                {likeCount > 0 ? likeCount : ''}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={(e) => e.stopPropagation()}><IosShareIcon fontSize="small" /></IconButton>
                    </Box>
                )}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>Editar</MenuItem>
                <MenuItem onClick={handleDelete} sx={{color: 'error.main'}}>Apagar</MenuItem>
            </Menu>
        </Box>
    );
}

export default PublicationItem;