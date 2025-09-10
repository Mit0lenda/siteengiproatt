<?php

namespace PHPMailer\PHPMailer;

class PHPMailer
{
    const CHARSET_ASCII = 'us-ascii';
    const CHARSET_ISO88591 = 'iso-8859-1';
    const CHARSET_UTF8 = 'utf-8';

    const CONTENT_TYPE_PLAINTEXT = 'text/plain';
    const CONTENT_TYPE_TEXT_CALENDAR = 'text/calendar';
    const CONTENT_TYPE_TEXT_HTML = 'text/html';
    const CONTENT_TYPE_MULTIPART_ALTERNATIVE = 'multipart/alternative';
    const CONTENT_TYPE_MULTIPART_MIXED = 'multipart/mixed';
    const CONTENT_TYPE_MULTIPART_RELATED = 'multipart/related';

    const ENCODING_7BIT = '7bit';
    const ENCODING_8BIT = '8bit';
    const ENCODING_BASE64 = 'base64';
    const ENCODING_BINARY = 'binary';
    const ENCODING_QUOTED_PRINTABLE = 'quoted-printable';

    const ENCRYPTION_STARTTLS = 'tls';
    const ENCRYPTION_SMTPS = 'ssl';

    protected $Priority;
    protected $CharSet = self::CHARSET_UTF8;
    protected $ContentType = self::CONTENT_TYPE_PLAINTEXT;
    protected $Encoding = self::ENCODING_8BIT;
    protected $ErrorInfo = '';
    protected $From = '';
    protected $FromName = '';
    protected $Sender = '';
    protected $Subject = '';
    protected $Body = '';
    protected $AltBody = '';
    protected $Mailer = 'smtp';
    protected $WordWrap = 0;
    protected $Hostname = '';
    protected $Host = 'localhost';
    protected $Port = 25;
    protected $Username = '';
    protected $Password = '';
    protected $SMTPSecure = '';
    protected $SMTPAuth = false;

    public function __construct($exceptions = null)
    {
        $this->exceptions = (null === $exceptions ? true : $exceptions);
    }

    public function isError()
    {
        return !empty($this->ErrorInfo);
    }

    public function isSMTP()
    {
        $this->Mailer = 'smtp';
    }

    public function setFrom($address, $name = '')
    {
        $this->From = $address;
        $this->FromName = $name;
        return true;
    }

    public function addAddress($address, $name = '')
    {
        return true;
    }

    public function addReplyTo($address, $name = '')
    {
        return true;
    }

    public function setSubject($subject)
    {
        $this->Subject = $subject;
        return true;
    }

    public function setBody($body)
    {
        $this->Body = $body;
        return true;
    }

    public function send()
    {
        return true;
    }
}
