$(function() {
    var socket = io()
    var board
    var solution
    socket.on('connected', function(data) {
        console.log('connected to server')
        //$('#activities').append('<li>You have connected</li>')
        addMessage('You have connected')
    })
    socket.on('user connected', function(data) {
        addMessage(data.player.username + ' is connected')
    })
    socket.on('user disconnected', function(data) {
        addMessage(data.player.username + ' has disconnected')
    })
    socket.on('message', function(data) {
        if (data.player) {
            addMessage(data.player.username + ': ' + data.message)
        } else {
            addMessage(data.message)
        }
    })
    socket.on('game created', function(data) {
        console.log(data.game.id)
        $('#gameLink').val("http://gisar.me/sudokuduel?id=" + data.game.id)
        $('#gameLink').focus().select()
        $('#copyLink').removeClass('disabled')
        //updateBoard(data.game.board)
        $('#player1').text(data.player.username)
        $('#gameBanner').removeClass('hide')
        console.log('starting game')
        socket.emit('start game', { id: data.game.id })
    })
    socket.on('game joined', function(data) {
        $('#player1').text(data.player.username)
        $('#gameBanner').removeClass('hide')
    })
    socket.on('join failed', function(data) {
        $('#createGame').removeClass('disabled')
        $('#joinGame').removeClass('disabled')
        Materialize.toast('game not found', 5000)
    })
    socket.on('player joined', function(data) {
        $('#player2').text(data.player.username)
    })
    socket.on('game started', function (data) {
        board = data.game.board
        solution = data.game.solution
        for (var i = 0; i < 81; i++) {
            var cell = $('#cell' + (i + 1))
            cell.text(board[i])
        }
    })

    function addMessage(m) {
        var a = $('#activities')
        a.append('<li class="collection-item">' + escapeTags(m) + '</li>')
        a.scrollTop(a[0].scrollHeight)
    }    
    function escapeTags(m) {
        return m.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
    function updateBoard(board) {
        for(var i = 1; i < 10; i++) {
            $('td#' + i).text(board[i].replace('X', '😡').replace('O', '💩'))
        }
    }
    function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    var hasUsername = false

    if (getUrlVars()['id']) {
        $('#createGame').addClass('disabled')
        $('#joinGame').addClass('disabled')
        socket.emit('join game', { id: getUrlVars()['id'] })
    }

    $('#input').keydown(function(e) {
        if (e.which == 13) {
            var val = $('#input').val()
            e.preventDefault()
            if (hasUsername) {
                if (val.trim()) {
                    socket.emit('send message', { message: val })
                }
            } else {
                socket.emit('set username', { username: val })
                addMessage('You have set your name to ' + val)
                $('#input').attr('placeholder', 'enter message')
                hasUsername = true
            }
            $('#input').val('')
        }
    })
    $('#createGame').on('click', function() {
        $('#createGame').addClass('disabled')
        $('#joinGame').addClass('disabled')
        socket.emit('create game')
    })
    $('#joinGame').on('click', function() {
        $('#createGame').addClass('disabled')
        $('#joinGame').addClass('disabled')
        gameId = $('#gameId').val()
        socket.emit('join game', { id: gameId })
    })
    $('#copyLink').on('click', function() {
        $('#gameLink').select()
        try {
            var cmd = document.execCommand('copy')
            var msg = cmd ? 'link copied' : 'copy failed'
            Materialize.toast(msg, 5000);
        } catch (err) {
            Materialize.toast('unknown error', 5000);
        }
    })

    $('#chatButton').on('click', function () {
        $('#chat').toggleClass('hide')
    })
    
    $('.cell, .number').on('click', function () {
        if (board && solution) {
            var selected = $('.selected').first().text()
            var val = $(this).text()
            if ($(this).hasClass('incorrect')) {
                $(this).text('')
                $(this).removeClass('incorrect')
                $(this).removeClass('selected')
                return
            }
            if (val) {                           
                if (val != selected) {
                    $('.cell').removeClass('selected')
                    $('.number').removeClass('selected')
                    $(this).addClass('selected')
                    $('.cell').each(function () {
                        var cell = $(this)
                        if (cell.text() == val) {
                            cell.addClass('selected')
                        }
                    })
                }
            } else {
                if (selected) {
                    var id = $(this).attr('id').substring(4)
                    board[id - 1] = parseInt(selected)
                    $(this).text(selected)
                    if (solution[id - 1] == selected) {
                        $(this).addClass('selected')
                    } else {
                        $(this).addClass('incorrect')
                    }
                    if (arraysEqual(board, solution)) {
                        gameFinished()
                    }
                }
            }
        }
    })

    function gameFinished() {
        window.alert('You won!')
        $('.cellRow').addClass('hide')
        $('.numbers').addClass('hide')
        $('.board').append('<h1>You won!</h1><p>(no you cannot restart the game without refreshing the page)')
        socket.emit('game finished')
    }

    function resize() {
        var cellWidth = $('.cell').width()
        $('.cell').height(cellWidth)
        $('.cell').css('font-size', cellWidth/1.5)
        var numberWidth = $('.number').width()
        $('.number').height(numberWidth)
        $('.number').css('font-size', numberWidth/1.5)
    }
    resize()
    $(window).on('resize', resize)
})