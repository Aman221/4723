import numpy as np
from numpy.polynomial import polynomial as poly
import hashlib
import os

# Kyber parameters
class KyberParams:
    def __init__(self, k=3, n=256, q=3329, eta1=2, eta2=2, du=10, dv=4):
        self.k = k          # Module rank
        self.n = n          # Polynomial degree (ring dimension)
        self.q = q          # Modulus
        self.eta1 = eta1    # Error distribution parameter for secret
        self.eta2 = eta2    # Error distribution parameter for noise
        self.du = du        # Compression parameter for ciphertext u
        self.dv = dv        # Compression parameter for ciphertext v

# Polynomial operations in R_q = Z_q[X]/(X^n + 1)
def poly_add(a, b, q):
    """Add two polynomials in R_q"""
    return np.mod(a + b, q)

def poly_mul(a, b, n, q):
    """Multiply two polynomials in R_q"""
    c = poly.polymul(a, b)
    # Reduce mod X^n + 1
    c = c[:n] + c[n:2*n-1]
    return np.mod(c, q)

def poly_neg(a, q):
    """Negate a polynomial in R_q"""
    return np.mod(-a, q)

# Sampling functions
def sample_uniform(n, q):
    """Sample a polynomial with coefficients uniformly from Z_q"""
    return np.random.randint(0, q, size=n)

def sample_binomial(n, eta):
    """Sample a polynomial with coefficients from a centered binomial distribution"""
    return np.sum(np.random.randint(0, 2, size=(n, 2*eta)), axis=1) - eta

def compress(x, d, q):
    """Compress a polynomial"""
    factor = 2**d / q
    return np.round(x * factor).astype(int) % (2**d)

def decompress(x, d, q):
    """Decompress a polynomial"""
    factor = q / (2**d)
    return np.round(x * factor).astype(int) % q

# Key generation
def keygen(params):
    """Generate a public and private key pair"""
    n, q, k, eta1 = params.n, params.q, params.k, params.eta1
    
    # Generate the public seed and noise seed
    seed_a = os.urandom(32)
    seed_e = os.urandom(32)
    
    # Generate the matrix A
    A = np.array([[sample_uniform(n, q) for _ in range(k)] for _ in range(k)])
    
    # Sample the secret vector s
    s = np.array([sample_binomial(n, eta1) for _ in range(k)])
    
    # Sample the error vector e
    e = np.array([sample_binomial(n, params.eta2) for _ in range(k)])
    
    # Calculate public key t = A·s + e
    t = np.zeros((k, n), dtype=int)
    for i in range(k):
        for j in range(k):
            t[i] = poly_add(t[i], poly_mul(A[i][j], s[j], n, q), q)
        t[i] = poly_add(t[i], e[i], q)
    
    public_key = (seed_a, t)
    private_key = s
    
    return public_key, private_key

# Encapsulation
def encapsulate(public_key, params):
    """Encapsulate a shared secret"""
    seed_a, t = public_key
    n, q, k, eta1, eta2, du, dv = params.n, params.q, params.k, params.eta1, params.eta2, params.du, params.dv
    
    # Generate the matrix A (in practice, this would be expanded from seed_a)
    A = np.array([[sample_uniform(n, q) for _ in range(k)] for _ in range(k)])
    
    # Generate random message m
    m = np.random.randint(0, 2, size=256)
    
    # Hash message to get r
    hash_input = m.tobytes() if hasattr(m, 'tobytes') else bytes(m.tolist())
    r_seed = hashlib.sha3_512(hash_input).digest()
    
    # Sample r from a centered binomial distribution
    r = np.array([sample_binomial(n, eta1) for _ in range(k)])
    
    # Sample error vector e1
    e1 = np.array([sample_binomial(n, eta2) for _ in range(k)])
    
    # Calculate u = A^T·r + e1
    u = np.zeros((k, n), dtype=int)
    for i in range(k):
        for j in range(k):
            u[i] = poly_add(u[i], poly_mul(A[j][i], r[j], n, q), q)
        u[i] = poly_add(u[i], e1[i], q)
    
    # Sample error e2
    e2 = sample_binomial(n, eta2)
    
    # Calculate v = t^T·r + e2 + ⌊q/2⌋·m
    v = np.zeros(n, dtype=int)
    for i in range(k):
        v = poly_add(v, poly_mul(t[i], r[i], n, q), q)
    v = poly_add(v, e2, q)
    
    # Encode message m
    encoded_m = (m * (q // 2)) % q
    v = poly_add(v, encoded_m, q)
    
    # Compress ciphertext
    u_compressed = [compress(u_i, du, q) for u_i in u]
    v_compressed = compress(v, dv, q)
    
    # Derive shared secret
    ciphertext = (u_compressed, v_compressed)
    shared_secret = hashlib.sha3_256(hash_input + np.array(ciphertext).tobytes()).digest()
    
    return ciphertext, shared_secret

# Decapsulation
def decapsulate(ciphertext, private_key, public_key, params):
    """Decapsulate a shared secret"""
    u_compressed, v_compressed = ciphertext
    s = private_key
    n, q, k, du, dv = params.n, params.q, params.k, params.du, params.dv
    
    # Decompress ciphertext
    u = [decompress(u_i, du, q) for u_i in u_compressed]
    v = decompress(v_compressed, dv, q)
    
    # Calculate m' = v - s^T·u
    mp = np.copy(v)
    for i in range(k):
        mp = poly_add(mp, poly_neg(poly_mul(s[i], u[i], n, q), q), q)
    
    # Decode message
    m_decoded = np.round(mp / (q // 2)) % 2
    
    # Re-encapsulate to verify
    # This would be a full re-encapsulation in a real implementation
    hash_input = m_decoded.tobytes() if hasattr(m_decoded, 'tobytes') else bytes(m_decoded.tolist())
    shared_secret = hashlib.sha3_256(hash_input + np.array(ciphertext).tobytes()).digest()
    
    return shared_secret